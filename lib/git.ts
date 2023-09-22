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

export type MergeCommitParents = [CommitHash, CommitHash]

export type MergeInfo = {
    merge_commit: CommitHash        // this is the resulting merge commit
    parents: MergeCommitParents // This must be exactly two commits because we never do octopus commits (right?)
    source: CommitHash      // this is generally a topic branch. We should be able to infer issue id from it
    target: CommitHash      // this is generally an epic or main branch
    base: CommitHash        // this should be an earlier commit on the target (epic) branch
}


export async function getMergeParents(merge_commit: CommitHash): Promise<MergeCommitParents>
{
    const result: string = (await doCommand([`git`, `rev-list`, `--parents`, `-n`, `1`, merge_commit]))
    const parts = result.split(' ')
    if (parts.length != 3) {
        console.error("Merge parents not valid:", result, parts)
    }
    const [_, parent1, parent2] = parts;
    return [parent1, parent2];
}

export async function getMergeBase(parents: MergeCommitParents) : Promise<CommitHash>
{
    const base: CommitHash = await doCommand([`git`, `merge-base`, parents[0], parents[1]])
    return base
}

export async function extractMergeInfo(match: RegExpMatchArray) : Promise<MergeInfo>
{
    const [_, merge_commit, source, target] = match
    const parents: MergeCommitParents = await getMergeParents(merge_commit)
    const base: CommitHash = await getMergeBase(parents)

    const info: MergeInfo = { merge_commit, parents, source, target, base }
    return info
}

export async function extractAncestry(block: string): MergeInfo[] {
    const lines = block.split("\n")
    const ancestry: MergeInfo[] = []
    for (const line of lines) {
        console.log("parsing line: ", line);
        const match = line.match(regexMerge)
        console.log(match)
        if (match) {
            const info = await extractMergeInfo(match)
            ancestry.push(info)
        }
    }
    return ancestry
}

export async function getAncestry(): Promise<MergeInfo[]> {
    const block = await doCommand(['git', "log", "--min-parents=2", "--first-parent", "--oneline", "--max-count=10", "HEAD"])
    return extractAncestry(block)
}
