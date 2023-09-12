



export async function getConfig(key: string): Promise<string> {
    const proc = Bun.spawn(["git", "config", "--get", key])
    const text = await new Response(proc.stdout).text()
    return text.trim()
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
