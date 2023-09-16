import { doCommand } from "./spawn"

export async function getConfig(key: string): Promise<string> {
    return doCommand(["git", "config", "--get", key])
}

export interface JiraConfig {
    host: string
    token: string
}

export async function getJiraConfig(): Promise<JiraConfig> {
    const host = await getConfig("jira.host")
    const user = await getConfig("jira.user") || await getConfig("user.email")
    const pat = await getConfig("jira.pat")
    const token = Buffer.from(`${user}:${pat}`).toString('base64')
    return { host, token }
}

export async function createBranch(name: string): Promise<string> {
    return doCommand(["git", "checkout", "-b", name])
}

export async function getCurrentBranch(): Promise<string> {
    return doCommand(["git", "rev-parse", "--abbrev-ref", "HEAD"])
}
