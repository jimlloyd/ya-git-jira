export type BranchType = 'topic' | 'epic' | 'release' | 'unknown'
import { isHash } from './git-hash'

function normalize(branch_name: string) : string
{
    return branch_name.replace(/^origin\//, "")
}

export function getBranchType(name: string): BranchType {
    if (isHash(name)) {
        console.error(`getBranchType(${name}) called with hash`)
        return 'unknown'
    }

    name = normalize(name)

    if (['develop', 'dakota-develop'].includes(name)) {
        return 'release'
    }

    if (name.startsWith('release/')) {
        return 'release'
    }

    if (name.startsWith('epic/')) {
        return 'epic'
    }

    if (name.match(/^\d+-/) || name.match(/^[A-Z]+-\d+-/)) {
        return 'topic'
    }

    if (name.startsWith('merge')) {
        return 'topic'
    }

    console.error(`getBranchType(${name}) called with unknown branch type`)
    return 'unknown'
}

export function isEpicOrRelease(branch: string): boolean {
    return ['epic', 'release'].includes(getBranchType(branch))
}
