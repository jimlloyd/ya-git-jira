import { CommitHash, isHash, shortHash } from './git-hash'
import { doCommand } from '../spawn'
import { DiGraph, VertexDefinition } from "digraph-js";
import { stringTag } from 'yaml/util';

export type Commit = {
    hash: CommitHash
    branches?: string[]
    tags?: string[]
}

export type MergeParentCommits = [Commit, Commit]

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
    const result: Commit = {
        hash: await shortHash(hash),
    }
    if (branches.length > 0) {
        result.branches = dedup(branches)
    }
    if (tags.length > 0) {
        result.tags = dedup(tags)
    }
    return result
}

export type MergeInfo = {
    merge_commit: Commit        // this is the resulting merge commit
    parents: MergeParentCommits // This must be exactly two commits because we never do octopus commits (right?)
    source: string      // this is generally a topic branch. We should be able to infer issue id from it
    target: string      // this is generally an epic or main branch
    base: Commit        // this should be an earlier commit on the target (epic) branch

    // parent0 is on the target branch  (epic)
    // parent1 is on the source branch  (topic)
    // the base commit is an earlier HEAD of the target branch
    // the merge commit is the new HEAD of the target branch
}

export async function getMergeParents(merge_commit: CommitHash): Promise<MergeParentCommits>
{
    const result: string = (await doCommand([`git`, `rev-list`, `--parents`, `-n`, `1`, merge_commit]))
    const parts = result.split(' ')
    if (parts.length != 3) {
        console.error("Merge parents not valid:", result, parts)
    }
    const [_, parent1, parent2] = parts;
    if (!isHash(parent1) || !isHash(parent2)) {
        console.warn("rev-list --parents gave weird result:", { result, parent1, parent2})
    }
    return [await asCommit(parent1), await asCommit(parent2)];
}

export async function getMergeBase(parents: MergeParentCommits) : Promise<CommitHash>
{
    return await doCommand([`git`, `merge-base`, parents[0].hash, parents[1].hash])
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

// 8e616c24b2 Merge branch 'CTRL-1497-hwio-only-write-outputs-on-change' into 'epic/dakota-develop'
const regexMerge = /^([a-f0-9]+) Merge branch '(\S+)' into '(\S+)'$/

export async function extractAncestry(block: string): Promise<MergeInfo[]> {
    const lines = block.split("\n")
    const ancestry: MergeInfo[] = []
    for (const line of lines) {
        const match = line.match(regexMerge)
        if (match) {
            const info = await extractMergeInfo(match)
            ancestry.push(info)
        }
    }

    const tagIndex = ancestry.findIndex(mergeInfo => !!mergeInfo.merge_commit.tags)
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

export type Vertex = VertexDefinition<MergeInfo>
export type Graph = DiGraph<Vertex>

export function renderAncestry(ancestry: MergeInfo[]) {

    const graph = new DiGraph<Vertex>()

    // Create all vertices and add links to the parent comments of the merge
    ancestry.forEach(info => {
        const id = info.merge_commit.hash
        const vertex: Vertex = {id: id, body: info, adjacentTo: []}
        graph.addVertex(vertex)
    })

    // Now that all verticies have been created, fill in the links
    // Links we need to add for each MergeInfo
    // base -> parent0
    // base -> parent1
    // parent0 -> merge_commit.hash
    // parent1 -> merge_commit.hash

    ancestry.forEach(info => {
        const base = info.base.hash
        const parent0 = info.parents[0].hash
        const parent1 = info.parents[1].hash
        const merge_commit = info.merge_commit.hash
        graph.addEdge({from: base, to: parent0})
        graph.addEdge({from: base, to: parent1})
        graph.addEdge({from: parent0, to: merge_commit})
        graph.addEdge({from: parent1, to: merge_commit})
    })

    const last = ancestry[ancestry.length-1]
    const main = last.target
    const branches = [ main ]
    let current = main;

    function renderCommit(hash: string) {
        console.log(`  commit id: "${hash}"`)
    }

    function renderBranch(branch: string) {
        console.log(`  branch ${branch}`)
    }

    function renderCheckout(branch: string) {
        console.log(`  checkout ${branch}`)
    }

    function addCommit(branch: string, hash: string): void {
        if (branch != current) {
            current = branch
            if (branches.includes(current)) {
                renderCheckout(current)
            } else {
                renderBranch(current)
                branches.push(current)
            }
        }
        renderCommit(hash)
    }

    function renderMerge(source: string, target: string) {
        if (current != target) {
            renderCheckout(target)
            current = target
        }
        console.log(`  merge ${source}`)
    }

    console.log(`%%{init: { 'gitGraph': {'mainBranchName': ${main}}} }%%`)
    console.log("gitGraph TB:")
    renderBranch(main)
    renderCommit(last.merge_commit.hash)
    for(const vertex of graph.traverse({ traversal: "dfs", rootVertexId: last.merge_commit.hash })) {
        const mergeInfo = vertex.body
        addCommit(mergeInfo.target, mergeInfo.parents[0].hash)
        addCommit(mergeInfo.source, mergeInfo.parents[1].hash)
        renderMerge(mergeInfo.source, mergeInfo.target)
    }

}
