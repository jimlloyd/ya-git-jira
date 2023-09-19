import type { JSONValue } from "../json"
import { gitlabApi } from "./api"

export type User = JSONValue & {
    id: number
    name: string
    username: string
    email: string
}

export async function whoami(): Promise<User> {
    return await gitlabApi("user") as User
}
