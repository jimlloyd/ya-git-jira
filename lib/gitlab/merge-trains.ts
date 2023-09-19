import { projectScopedGet } from './project'
import type { JSONValue } from '../json'

export type MergeTrain = JSONValue & {
    id: number
    merge_request: {
        title: string
        web_url: string
    }
    user: {
        username: string
    }
    target_branch: string
    status: string
}

export async function getMergeTrains(): Promise<MergeTrain[]> {
    return await projectScopedGet(`merge_trains`) as MergeTrain[]
}
