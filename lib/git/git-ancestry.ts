import { CommitHash, shortHash } from './git-hash'
import { doCommand } from '../spawn'
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { Dayjs } from 'dayjs';
import { MergeCommit } from '../merge-graph'
import { getBranchType, isEpicOrRelease } from './commit-type';
import { getDescribe, mergeBase } from './git-base';
import { getRemoteBranches } from '../gitlab';
import { JSONValue, renderYaml } from '../json';
import { render } from 'mermaid/dist/dagre-wrapper/index.js';

dayjs.extend(weekOfYear)

export type Commit = {
    hash: CommitHash
    branches?: string[]
    tags?: string[]
}

export type MergeData = MergeCommit & {
    date: Dayjs,
    extra: string[]
}

function parseMerginInfo(line: string): MergeData
{
    const regex = /^(\S+) (\S+) (\S+) (\S+) Merge.+ '(\S+)' into ('([^'\s]+)'|([^'\s]+))(.*)$/
    const match = line.match(regex)
    if (!match) {
        return { date: dayjs(), commit:'', parent0:'', parent1:'', base:'', source: 'badparse', target: '', extra: [line] }
    }
    let [, commit, ymd, parent0, parent1, source, , t1, t2, xtra] = match
    xtra = xtra.trim()
    let target = t1 || t2

    if (getBranchType(target)=='topic' && ['epic', 'release'].includes(getBranchType(source))) {
        ([source, target] = [target, source])
    }

    let extra = xtra.length==0 ? [] : xtra.split(',').map(s => {
        s = s.trim()
        s = s.replace('tag: ', '')
        return s
    })
    extra = extra.filter(b => !!b.match(/^v\d+\./)).slice(0,1)
    const date: Dayjs = dayjs(ymd)
    return { commit, date, parent0, parent1, source, target, extra } as MergeData
}

export async function getMergeHistory(commitish: string, N: number = 30): Promise<MergeData[]>
{
    const text = await doCommand([`git`, `log`, `--format=%h %cd %p %s %D`, `--min-parents=2`, `--first-parent`, `--max-count=${N}`, `--date=iso-strict`, commitish])
    // 488373635d 2023-09-19 1d6567f29a 58ac562e16 Merge branch 'CTRL-2311-remove-more-rq-f-signals' into 'release/v26'

    const lines = text.split('\n')
    const data: MergeData[] = lines.map(line => parseMerginInfo(line))

    return data
}

export async function getEpicBranches(maxAge: number): Promise<string[]> {
    const epics = await getRemoteBranches({ search: '^epic/', maxAge })
    const releases = await getRemoteBranches({ search: '^release/', maxAge })
    const epicBranches = [...epics.map(b => b.name),  ...releases.map(b => b.name), 'develop'].sort()
    return epicBranches;
}

export type FullHistoryOptions = {
    days?: number,
    commits?: number,
    pending?: boolean,
}

export async function extractFullMergeHistory(options: FullHistoryOptions = {}): Promise<MergeData[]>
{
    const { days, commits } = options
    let cutoff = dayjs().subtract(days || 90, 'day')
    const epicBranches = await getEpicBranches(days || 90);
    const addedCommits: Set<string> = new Set()
    const unique: MergeData[] = []
    const promises = epicBranches.map(async epic => {
        const branch = `origin/${epic}`
        const history: MergeData[] = await getMergeHistory(branch, commits || 50)
        history.forEach(item => {
            const { commit } = item
            if (addedCommits.has(commit)) {
                return
            }
            else {
                addedCommits.add(commit)
                if (item.date.isBefore(cutoff)) {
                    return
                }
                unique.push(item)
            }
        })
    })
    await Promise.all(promises)
    let merge_commits = unique.sort((a, b) => a.date.isBefore(b.date) ? -1 : 1)

    let ordered_targets = orderedTargets(merge_commits)
    const startCommits = ordered_targets.map(target =>  merge_commits.find(m => m.target == target)).filter(m => !!m).map(m => m!.commit)
    const roots = await extendToRoot(startCommits)
    console.log('roots', roots)
    const addedRoots = await Promise.all(roots.map(async root => await asMergeInfo(root)))
    merge_commits = merge_commits.concat(addedRoots)
    merge_commits.sort((a, b) => a.date.isBefore(b.date) ? -1 : 1)
    merge_commits = merge_commits.filter((m, i) => m.commit != merge_commits[i-1]?.commit)

    return merge_commits
}

function normalize(branch_name: string) : string
{
    return branch_name.replace(/^origin\//, "")
}

function orderedTargets(merge_commits: MergeData[]): string[]
{
    let d = dayjs(0)
    const targets = new Set<string>()
    merge_commits.forEach(merge_commit => {
        const { source, target, date } = merge_commit
        if (date.isAfter(d)) {
            d = date
        } else {
            console.error('Dates out of order!', { date, d })
            process.exit(1)
        }
        targets.add(target)
        if (isEpicOrRelease(source)) {
            targets.add(source)
        }
    })
    const ordered_targets = Array.from(targets).sort()
    return ordered_targets
}

function weekMarkers(merge_commits: MergeData[]): string[]
{
    const markers = new Set<string>()
    merge_commits.forEach(merge_commit => {
        const { date } = merge_commit
        const week = date.startOf('week')
        markers.add(week.format('YYYY-MM-DD'))
    })
    const ordered = Array.from(markers).sort()
    return ordered
}

type BranchMergeBases = Record<string, string>
type BranchMergeBasesMap = Record<string, BranchMergeBases>

async function extendToRoot(startCommits: string[]): Promise<string[]> {
    console.log('startCommits', startCommits)
    const roots: Set<string> = new Set()
    while (startCommits.length > 0) {
        const next = startCommits.pop()
        if (next) {
            const promises = startCommits.map(async root => {
                const base = await shortHash(await mergeBase(root, next))
                if (base) {
                    console.log(`adding new root base ${base} for ${root},${next}`)
                    roots.add(base)
                } else {
                    console.log(`no base found for ${root},${next}`)
                }
            })
            await Promise.all(promises)
            roots.add(next)
        }
    }
    return Array.from(roots)
}

async function asMergeInfo(commit: string): Promise<MergeData> {
    const line = await doCommand([`git`, `log`, `--format=%h %cd %p %s %D`, `--min-parents=2`, `--first-parent`, `--max-count=1`, `--date=iso-strict`, commit])
    const mergeInfo = parseMerginInfo(line)
    return mergeInfo
}

export async function renderGitGraph(merge_commits: MergeData[]): Promise<string>
{
    const chunks: string[] = []
    function write(s: string) {
        chunks.push(s)
    }

    const ordered_targets = orderedTargets(merge_commits)
    const markers: string[] = weekMarkers(merge_commits)
    markers.forEach(marker => console.log(marker))

    write(`---`)
    write(`config:`)
    write(`  gitGraph:`)
    write(`     rotateCommitLabel: true`)
    write(`     mainBranchName: "date"`)
    write(`---`)
    write(`gitGraph LR:`)

    for (let i = 0; i < ordered_targets.length; i++) {
        write(`  branch ${ordered_targets[i]} order: ${i+1}`)
    }

    let current: string = ""
    function renderCheckout(branch: string) {
        if (branch != current) {
            current = branch
            write(`  checkout ${branch}`)
        }
    }

    const branchMergeBasesMap : BranchMergeBasesMap = {}
    const seen: Set<string> = new Set()

    async function renderCommit(id: string, commit: string, tag?: string): Promise<void> {
        // const match = id.match(/^(([A-Z]+-)?(\d+))-/)
        // let name = match && match.length >= 3 ? match[1] : id
        // if (seen.has(`${name}-${commit}`)) {
        //     return  // already rendered
        // } else  if (seen.has(name)) {
        //     name = `${name}-${commit}`
        //     seen.add(name)
        // } else {
        //     seen.add(name)
        // }
        const name = await getDescribe(commit)
        if (seen.has(name)) {
            return  // already rendered
        }
        seen.add(name)
        if (tag) {
            write(`  commit id: "${name}" tag: "${tag}"`)
        } else {
            write(`  commit id: "${name}"`)
        }
    }

    // We have to maintain our own concept of the HEAD commit in each branch.
    // The HEAD commit for a branch is unknown until we've seen a MergeData with that branch as the target.
    // We can't compute the distance between two epic branches until have the HEAD commit for both.

    type Heads = Record<string, string>
    const heads: Heads = {}

    async function renderMergeCommit(merge_commit: MergeData): Promise<void> {
        let { commit, source, target, extra } = merge_commit
        source = normalize(source)  // generally a topic branch
        target = normalize(target)  // generally a release or epic branch

        heads[target] = commit

        const mergeBases = branchMergeBasesMap[target] || {}
        branchMergeBasesMap[target] = mergeBases
        const promises = ordered_targets.map(async t => {
            if (t == target || heads[t]==undefined)
            {}
            else {
                const base: string = await mergeBase(commit, heads[t])
                if (mergeBases[t] == undefined ) {
                    mergeBases[t] = base
                }
                else if (mergeBases[t] != base) {
                    mergeBases[t] = base
                    renderCheckout(t)
                    await renderCommit(source, commit)
                    renderCheckout(target)
                    write(`  merge ${t} id: "merge-${t}-${commit}-into-${target}"`)
                }
            }
        })
        await Promise.all(promises)

        const tag = extra.find(s => !!s.match(/^v\d+\./))

        renderCheckout(target)
        await renderCommit(source, commit, tag)
    }

    let marker = markers.shift()
    if (marker) {
        renderCheckout('date')
        write(`  commit tag: "${marker}"`)
    }

    function doAll(merge_data: MergeData[]) : Promise<void> {
        let p = Promise.resolve();
        merge_data.forEach((mergeInfo: MergeData) => {
            p = p.then(async () => {
                const { date } = mergeInfo
                if (markers.length > 0) {
                    const next = dayjs(markers[0])
                    if (date.isAfter(next, 'day')) {
                        marker = markers.shift()
                        if (marker) {
                            renderCheckout('date')
                            write(`  commit tag: "${marker}"`)
                        }
                    }
                }
                await renderMergeCommit(mergeInfo)
            })
        })
        return p;
    };
    await doAll(merge_commits);

    const result = chunks.join('\n')
    return result
}
