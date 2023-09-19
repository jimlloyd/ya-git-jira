import { projectScopedGet } from './project'
import type { JSONValue } from '../json'
import { whoami } from './user'
import { gitlabApi } from './api'

export type MergeRequest = JSONValue & {
    id: number
    title : string
    description : string
    state : string
    source_branch: string
    target_branch: string
    web_url: string
    merge_status: string
}

export async function getMergeRequest(id: string): Promise<MergeRequest> {
    return await projectScopedGet(`merge_requests/${id}`) as MergeRequest
}

export async function getMyMergeRequestsInProgress() : Promise<Array<MergeRequest>>
{
    const me = await whoami()
    return await gitlabApi(`merge_requests?state=opened&author_id=${me.id}`) as Array<MergeRequest>
}

export async function getMyMergeRequestsToReview() : Promise<Array<MergeRequest>>
{
    const me = await whoami()
    return await gitlabApi(`merge_requests?state=opened&reviewer_id=${me.id}`) as Array<MergeRequest>
}
