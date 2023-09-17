import { getConfig } from "./git"
import type { JSONValue } from "./json"

export interface GitlabConfig {
    host: string
    user: string
    token: string
}

export async function getGitlabConfig(): Promise<GitlabConfig> {
    const host = await getConfig("gitlab.host")
    if (!host) throw new Error("gitlab.host not in git config")
    const user = await getConfig("user.email")
    if (!user) throw new Error("user.email not in git config")
    const token = await getConfig("gitlab.token")
    if (!token) throw new Error("gitlab.token not in git config")
    return { host, user, token }
}

export async function get(endpoint: string): Promise<JSONValue> {
    const method = "GET"
    const { host, token } = await getGitlabConfig()
    const base = `https://${host}/api/v4`
    const uri = `${base}/${endpoint}`
    const headers = new Headers()
    headers.append("Accept", "application/json")
    headers.append('Private-Token', token)
    const options = {
        method,
        headers,
    }
    const request = new Request(uri, options)
    const response = await fetch(request)
    return await response.json()
}

export type User = JSONValue & {
    id: number
    name: string
    username: string
    email: string
}

export async function whoami(): Promise<User> {
    return await get("/user") as User
}
