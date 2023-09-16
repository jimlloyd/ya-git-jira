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
    if (!host) throw new Error("jira.host not in git config")
    const user = await getConfig("jira.user") || await getConfig("user.email")
    if (!user) throw new Error("jira.user or user.email not in git config")
    const pat = await getConfig("jira.pat")
    if (!pat) throw new Error("jira.pat not in git config")
    const token = Buffer.from(`${user}:${pat}`).toString('base64')
    return { host, token }
}

export async function createBranch(name: string): Promise<string> {
    return doCommand(["git", "checkout", "-b", name])
}

export async function getCurrentBranch(): Promise<string> {
    return doCommand(["git", "rev-parse", "--abbrev-ref", "HEAD"])
}
