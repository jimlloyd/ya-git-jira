import { getConfig } from "../git"

export interface GithubConfig {
    user: string
    token: string
}

const githubTokenP = getConfig("github.token", { expectQuiet: true })
const githubUserP = getConfig("github.user", { expectQuiet: true })
const gitEmailP = getConfig("user.email")

export async function getGithubConfig(): Promise<GithubConfig> {
    const user = await githubUserP || await gitEmailP
    if (!user) throw new Error("Neither github.user nor user.email in git config.\nSet with: git config --global github.user <username>")
    const token = await githubTokenP
    if (!token) throw new Error("github.token not in git config.\nSet with: git config --global github.token <token>")
    return { user, token }
}
