import { DiGraph, VertexDefinition, VertexBody } from "digraph-js";

export type MergeCommit =  VertexBody & {
    commit: string,
    parent0: string,
    parent1: string,
    target: string, // parent0 branch name
    source: string  // parent1 branch name
}

export type Vertex = VertexDefinition<MergeCommit>
export type Graph = DiGraph<Vertex>

export function asGraph(merge_commits: MergeCommit[]) : Graph
{
    const graph = new DiGraph<Vertex>()

    // Create all vertices
    merge_commits.forEach(merge_commit => {
        const id = merge_commit.commit
        const vertex: Vertex = {id: id, body: merge_commit, adjacentTo: []}
        graph.addVertex(vertex)
    })

    // Add edges from parents to merge commit
    merge_commits.forEach(info => {
        const { commit, parent0, parent1 } = info
        graph.addEdge({from: parent0, to: commit})
        graph.addEdge({from: parent1, to: commit})
    })

    return graph
}

function normalize(branch_name: string) : string
{
    return branch_name.replace(/^origin\//, "")
}

// We assume that the parent0 of the merge commit is an epic branch
// and the parent1 is a topic branch. We are omiting details about
// the topic branch and simply showing the entire topic branch as one commit
// on the epic branch in the graph

export function renderGraph(graph: Graph) : void
{
    console.log(`gitGraph LR:`)

    let current: string = ""
    let branches: string[] = []

    function renderBranch(branch: string) {
        console.log(`  branch ${branch}`)
    }

    function renderCheckout(branch: string) {
        console.log(`  checkout ${branch}`)
    }

    function renderCommit(id: string) {
        const match = id.match(/^([A-Z]+-)?(\d+)-/)
        const name = match && match.length >= 3 ? match[2] : id
        console.log(`  commit id: "${name}"`)
    }

    function addMergeCommit(merge_commit: MergeCommit): void {
        let { source, target } = merge_commit
        source = normalize(source)
        target = normalize(target)

        if (target != current) {
            current = target
            if (branches.includes(current)) {
                renderCheckout(current)
            } else {
                renderBranch(current)
                branches.push(current)
            }
        }
        renderCommit(source)
    }

    for(const vertex of graph.traverse({ traversal: "dfs"})) {
        addMergeCommit(vertex.body)
    }
}
