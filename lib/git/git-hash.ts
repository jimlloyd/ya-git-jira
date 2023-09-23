import { doCommand } from "../spawn"

export type CommitHash = string

export function isHash(maybeHash: string): boolean {
    return maybeHash.match(/^[a-f0-9]+$/) != null
}

export async function shortHash(hash: CommitHash): Promise<CommitHash> {
    if (!isHash(hash)) {
        console.warn('shortHash given bad hash:', hash)
    }
    const short = await doCommand([`git`, `rev-parse`, `--short`, hash])
    if (!isHash(short)) {
        console.warn('shortHash produced bad hash:', short)
    }
    return short
}
