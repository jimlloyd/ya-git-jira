
import { getConfig } from "../lib/git"
import type { JSONValue } from "../lib/json"

export type Issue = JSONValue & {
    key: string,
    self: string,
    fields: {
        summary: string
    }
}
export interface JiraConfig {
    host: string
    token: string
}

const gitEmailP = getConfig("user.email")
const jiraEmailP = getConfig("jira.user")
const hostP = getConfig("jira.host")
const tokenP = getConfig("jira.token")

export async function getJiraConfig(): Promise<JiraConfig> {
    const host = await hostP
    if (!host) throw new Error("jira.host not in git config")
    const user = await jiraEmailP || await gitEmailP
    if (!user) throw new Error("jira.user or user.email not in git config")
    const pat = await tokenP
    if (!pat) throw new Error("jira.token not in git config")
    const token = Buffer.from(`${user}:${pat}`).toString('base64')
    return { host, token }
}

export async function jiraApi(endpoint: string): Promise<JSONValue> {
    if (endpoint.startsWith("/")) {
        console.warn(`jiraApi: endpoint ${endpoint} starts with /`)
        endpoint = endpoint.slice(1)
    }
    const method = "GET"
    const { host, token } = await getJiraConfig()
    const uri = `https://${host}/rest/api/3/${endpoint}`
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
    const result = await response.json()
    return result;
}

export async function getIssue(issue: string): Promise<Issue> {
    const result = await jiraApi(`issue/${issue}`) as Issue
    return result
}

type Myself = JSONValue & {
    accountId: string
}

export async function getMyself(): Promise<Myself> {
    return await jiraApi("/myself") as Myself
}

type SearchResponse = JSONValue & {
    issues: Array<Issue>
}

export async function myUnresolvedIssues(): Promise<Array<Issue>> {
    const myself = await getMyself()
    const myselfId = myself.accountId
    const jql = `assignee = ${myselfId} AND resolution = Unresolved`
    const issues = await jiraApi(`/search?jql=${encodeURIComponent(jql)}`) as SearchResponse
    return issues.issues
}
