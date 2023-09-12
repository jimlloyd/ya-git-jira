
import { getJiraConfig } from "../lib/git"

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>

export async function get(endpoint: string): Promise<JSONValue> {
    const method = "GET"
    const { host, token } = await getJiraConfig()
    const base = `https://${host}/rest/api/3`
    const uri = `${base}/${endpoint}`
    const auth = `Basic ${token}`
    const headers = new Headers()
    headers.append("Authorization", auth)
    headers.append("Accept", "application/json")
    const options = {
        method,
        headers,
    }
    const request = new Request(uri, options)
    const response = await fetch(request)
    return await response.json()
}

type Issue = JSONValue & {
    fields: {
        summary: string
    }
}


export async function getIssue(issue: string): Promise<Issue> {
    return await get(`/issue/${issue}`) as Issue
}

export async function getMyself(): Promise<JSONValue> {
    return await get("/myself")
}
