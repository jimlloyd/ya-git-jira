import { getConfig } from "../git"

export interface GitlabConfig {
    host: string
    user: string
    token: string
}

const hostP = getConfig("gitlab.host")
const userP = getConfig("user.email")
const tokenP = getConfig("gitlab.token")

export async function getGitlabConfig(): Promise<GitlabConfig> {
    const host = await hostP
    if (!host) throw new Error("gitlab.host not in git config")
    const user = await userP
    if (!user) throw new Error("user.email not in git config")
    const token = await tokenP
    if (!token) throw new Error("gitlab.token not in git config")
    return { host, user, token }
}
