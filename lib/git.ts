import { doCommand, defaultOptions } from "./spawn"

export async function getConfig(key: string, options = defaultOptions): Promise<string> {
    return doCommand(["git", "config", "--get", key], options)
}

export async function createBranch(name: string): Promise<string> {
    return doCommand(["git", "checkout", "-b", name])
}

export async function getCurrentBranch(): Promise<string> {
    return doCommand(["git", "rev-parse", "--abbrev-ref", "HEAD"])
}

export async function getRemote(): Promise<string> {
    return doCommand(['git', "ls-remote", "--get-url", "origin"])
}

// 8e616c24b2 Merge branch 'CTRL-1497-hwio-only-write-outputs-on-change' into 'epic/dakota-develop'
const regexMerge = /^([a-f0-9]+) Merge branch '(\S+)' into '(\S+)'$/

export type CommitHash = string

// $ git for-each-ref --points-at=ab67b66d02
// fad39f98b4b77a6bad4e25e8e0d63484a3fdfc4c tag    refs/tags/v28.0.0
// $ git for-each-ref --points-at=d84a6813ac
// d84a6813acca7f6daae9836f608e8ac8435da159 commit refs/remotes/origin/CTRL-1447-merge-epic-nox-sensor-into-develop
// d84a6813acca7f6daae9836f608e8ac8435da159 commit refs/remotes/origin/CTRL-1448-merge-epic-nox-sensor-into-release-v24

export type MergeParentHashes = [CommitHash, CommitHash]
export type MergeParentCommits = [Commit, Commit]

export type Commit = {
    hash: CommitHash
    branches: string[]
    tags: string[]
}

function isHash(maybeHash: string): boolean {
    return maybeHash.match(/^[a-f0-9]+$/) != null
}

export async function shortHash(hash: string): Promise<string> {
    const short = await doCommand([`git`, `rev-parse`, `--short`, hash])
    return short
}

function dedup(items: string[]) : string[] {
    return [...new Set(items)].sort()
}

function branchNameFromRef(ref: string): string {
    const refParts = ref.split('/');
    let name = refParts.pop() as string
    const before = refParts.pop()
    if (before == 'epic' || before=='release')
        name = `${before}/${name}`
    return name
}

function tagNameFromRef(ref: string): string {
    const refParts = ref.split('/');
    const name = refParts.pop() as string
    return name
}

export async function asCommit(hash: string): Promise<Commit>
{
    if (!isHash(hash))
    {
        console.error('asCommit() called on non-hash string:', hash)
        process.exit(1)
    }
    let branches: string[] = []
    let tags: string[] = []
    const refs = await doCommand([`git`, `for-each-ref`, `--points-at=${hash}`], { expectQuiet: true})
    if (refs) {
        const lines = refs.split('\n')
        lines.forEach(line => {
            const lineParts = line.split(/\s+/)
            if (lineParts.length != 3) {
                console.error('for-each-ref line should have 3 parts:', { line, lineParts })
                process.exit(1)
            }
            const [_, kind, ref] = lineParts
            if (!kind || !ref) {
                console.error('unrecognized for-each-ref line:', { refs, lines, line, kind, ref})
                process.exit(1)
            }
            if (kind == 'tag') {
                tags.push(tagNameFromRef(ref))
            } else if (kind == 'commit') {
                branches.push(branchNameFromRef(ref))
            } else {
                console.error('Unrecognized ref kind:', kind)
                process.exit(1)
            }
        })
    }
    return {
        hash: await shortHash(hash),
        branches: dedup(branches),
        tags: dedup(tags)
    }
}

export type MergeInfo = {
    merge_commit: Commit        // this is the resulting merge commit
    parents: MergeParentCommits // This must be exactly two commits because we never do octopus commits (right?)
    source: string      // this is generally a topic branch. We should be able to infer issue id from it
    target: string      // this is generally an epic or main branch
    base: Commit        // this should be an earlier commit on the target (epic) branch
}


export async function getMergeParents(merge_commit: CommitHash): Promise<MergeParentCommits>
{
    const result: string = (await doCommand([`git`, `rev-list`, `--parents`, `-n`, `1`, merge_commit]))
    const parts = result.split(' ')
    if (parts.length != 3) {
        console.error("Merge parents not valid:", result, parts)
    }
    const [_, parent1, parent2] = parts;
    return [await asCommit(parent1), await asCommit(parent2)];
}

export async function getMergeBase(parents: MergeParentCommits) : Promise<CommitHash>
{
    const base: CommitHash = await doCommand([`git`, `merge-base`, parents[0].hash, parents[1].hash])

    return base
}

export async function extractMergeInfo(match: RegExpMatchArray) : Promise<MergeInfo>
{
    const [_, merge_commit_, source, target] = match
    const merge_commit = await asCommit(merge_commit_)
    const parents: MergeParentCommits = await getMergeParents(merge_commit_)
    const base_: CommitHash = await getMergeBase(parents)
    const base = await asCommit(base_)

    const info: MergeInfo = { merge_commit, parents, source, target, base }
    return info
}

export async function extractAncestry(block: string): Promise<MergeInfo[]> {
    const lines = block.split("\n")
    const ancestry: MergeInfo[] = []
    for (const line of lines) {
        // console.log("parsing line: ", line);
        const match = line.match(regexMerge)
        // console.log(match)
        if (match) {
            const info = await extractMergeInfo(match)
            ancestry.push(info)
        }
    }

    const tagIndex = ancestry.findIndex(mergeInfo => mergeInfo.merge_commit.tags.length>0)
    if (tagIndex === -1) {
        console.warn('No tags found in ancestry!')
        return ancestry
    }
    return ancestry.slice(0, tagIndex+1)
}

export async function getAncestry(): Promise<MergeInfo[]> {
    const block = await doCommand(['git', "log", "--min-parents=2", "--first-parent", "--oneline", "--max-count=30", "HEAD"])
    return extractAncestry(block)
}
