import { projectScopedGet } from './project'
import type { JSONValue } from '../json'

export type MergeTrainBrief = {
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

export type MergeTrainSimple = {
    title: string
    target_branch: string
    username: string
}

export type MergeTrain = JSONValue & MergeTrainBrief

export async function getMergeTrains(): Promise<MergeTrain[]> {
    return await projectScopedGet(`merge_trains`) as MergeTrain[]
}

export function briefly_one(train: MergeTrain) : MergeTrainSimple {
    const { target_branch, merge_request: { title }, user: { username} } = train
    return { title, target_branch, username }
}

export function briefly_list(trains: MergeTrain[]) : MergeTrainSimple[]
{
    return trains.map(briefly_one)
}
