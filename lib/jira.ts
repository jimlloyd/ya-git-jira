
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

export async function getJiraConfig(): Promise<JiraConfig> {
    const host = await getConfig("jira.host")
    if (!host) throw new Error("jira.host not in git config")
    const user = await getConfig("jira.user") || await getConfig("user.email")
    if (!user) throw new Error("jira.user or user.email not in git config")
    const pat = await getConfig("jira.pat")
    if (!pat) throw new Error("jira.pat not in git config")
    const token = Buffer.from(`${user}:${pat}`).toString('base64')
    return { host, token }
}

export async function jiraApi(endpoint: string): Promise<JSONValue> {
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

export async function getIssue(issue: string): Promise<Issue> {
    return await jiraApi(`/issue/${issue}`) as Issue
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
