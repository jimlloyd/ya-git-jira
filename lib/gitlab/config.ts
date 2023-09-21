import { getConfig } from "../git"

export interface GitlabConfig {
    host: string
    user: string
    token: string
}

const gitEmailP = getConfig("user.email")
const gitlabEmailP = getConfig("gitlab.user", { expectQuiet: true})
const hostP = getConfig("gitlab.host")
const tokenP = getConfig("gitlab.token")

export async function getGitlabConfig(): Promise<GitlabConfig> {
    const host = await hostP || 'gitlab.com'
    const user = await gitEmailP || await gitlabEmailP
    if (!user) throw new Error("Neither user.email nor gitlab.email in git config")
    const token = await tokenP
    if (!token) throw new Error("gitlab.token not in git config")
    return { host, user, token }
}
