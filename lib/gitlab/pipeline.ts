import { dlog } from "./dlog"
import { projectScopedGet } from "./project"
import { whoami } from "./user"
import type { JSONValue } from "../json"

export type Pipeline = JSONValue & {
    id: number
    status: string
    ref: string
    sha: string
    web_url: string
    updated_at: string  // datetime string like "2021-03-18T15:00:00.000Z"
}

export type PipelineStatus = 'success' | 'running'

export interface GetPipelineOptions {
    days: number
    status: PipelineStatus
}

export async function getProjectPipelines(options: GetPipelineOptions): Promise<Array<Pipeline>> {
    const { days, status } = options
    const me = await whoami()
    const username = me.username
    const date = new Date()
    const pastDate = date.getDate() - days;
    date.setDate(pastDate)
    const updated = date.toISOString()
    dlog(`updated: ${updated}`)
    return await projectScopedGet(`pipelines?status=${status}&username=${username}&updated_after=${updated}`) as Array<Pipeline>
}
