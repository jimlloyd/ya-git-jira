import { CommitHash } from './git-hash'
import { doCommand } from '../spawn'
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { Dayjs } from 'dayjs';
import { MergeCommit } from '../merge-graph'
import { getBranchType, isEpicOrRelease } from './commit-type';
import { mergeBase } from './git-base';
import { getRemoteBranches } from '../gitlab';

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

export async function getMergeHistory(commitish: string, N: number = 30): Promise<MergeData[]>
{
    const text = await doCommand([`git`, `log`, `--format=%h %cd %p %s %D`, `--min-parents=2`, `--first-parent`, `--max-count=${N}`, `--date=iso-strict`, commitish])
    // 488373635d 2023-09-19 1d6567f29a 58ac562e16 Merge branch 'CTRL-2311-remove-more-rq-f-signals' into 'release/v26'

    const lines = text.split('\n')
    const regex = /^(\S+) (\S+) (\S+) (\S+) Merge.+ '(\S+)' into ('([^'\s]+)'|([^'\s]+))(.*)$/
    const data: MergeData[] = lines.map(line => {
        const match = line.match(regex)
        if (!match) {
            return { date: dayjs(), commit:'', parent0:'', parent1:'', base:'', source: 'badparse', target: '', extra: [line] }
        } else {
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
    })

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
    const ordered = unique.sort((a, b) => a.date.isBefore(b.date) ? -1 : 1)
    return ordered
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

export async function renderGitGraph(merge_commits: MergeData[]): Promise<string>
{
    const ordered_targets = orderedTargets(merge_commits)
    const markers: string[] = weekMarkers(merge_commits)
    markers.forEach(marker => console.log(marker))

    const chunks: string[] = []
    function write(s: string) {
        chunks.push(s)
    }

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

    function renderCommit(id: string, commit: string, tag?: string) {
        const match = id.match(/^(([A-Z]+-)?(\d+))-/)
        let name = match && match.length >= 3 ? match[1] : id
        if (seen.has(name)) {
            name = `${name}-${commit}`
        } else {
            seen.add(name)
        }
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
                    renderCommit(source, commit)
                    // write(`  commit id: "${source}"`)
                    renderCheckout(target)
                    write(`  merge "${t}"`)
                }
            }
        })
        await Promise.all(promises)

        const tag = extra.find(s => !!s.match(/^v\d+\./))

        renderCheckout(target)
        renderCommit(source, commit, tag)
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
