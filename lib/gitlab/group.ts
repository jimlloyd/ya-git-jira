import { gitlabApi } from './api'
import { JSONValue } from '../json'

export type Group = JSONValue & {
    id: number
    name: string
    full_path: string
}

export async function getGroups(): Promise<Array<Group>> {
    return await gitlabApi(`groups`) as Array<Group>
}
