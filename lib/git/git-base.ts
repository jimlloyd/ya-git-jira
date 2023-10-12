import { commit } from "mermaid/dist/diagrams/git/gitGraphAst.js"
import { doCommand, defaultOptions } from "../spawn"

export async function getConfig(key: string, options = defaultOptions): Promise<string> {
    return doCommand(["git", "config", "--get", key], options)
}

export async function createBranch(name: string): Promise<string> {
    return doCommand(`git checkout -b ${name}`, { errorIsBenign: true })
}

export async function getCurrentBranch(): Promise<string> {
    return doCommand(`git rev-parse --abbrev-ref HEAD`)
}

export async function getRemote(): Promise<string> {
    return doCommand(`git ls-remote --get-url origin`)
}

export async function mergeBase(parent0: string, parent1: string): Promise<string> {
    return doCommand(`git merge-base ${parent0} ${parent1}`)
}

export async function commitDistance(parent: string, child: string): Promise<number> {
    const distance = await doCommand(`git rev-list --count --first-parent ${parent}..${child}`)
    return parseInt(distance)
}

export async function getMergeBaseDistances(parent0: string, parent1: string): Promise<number[]> {
    const base = await mergeBase(parent0, parent1)
    return Promise.all([commitDistance(parent0, base), commitDistance(parent1, base)])
}

export async function getDistanceToCommonCommit(current: string, other: string): Promise<number> {
    const base = await mergeBase(current, other)
    return await commitDistance(current, base)
}
