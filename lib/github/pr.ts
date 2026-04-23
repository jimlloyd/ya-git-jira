import { githubApi } from "./api"
import { getRemote } from "../git"

export interface PullRequest {
    number: number
    title: string
    html_url: string
    head: { ref: string }
    base: { ref: string }
    state: string
    draft: boolean
    user: { login: string }
    merged_at: string | null
}

export interface CheckRun {
    id: number
    name: string
    status: string
    conclusion: string | null
    html_url: string
}

/** Parse owner/repo from a GitHub SSH or HTTPS remote URL */
export function parseRepo(remote: string): { owner: string; repo: string } {
    // git@github.com:owner/repo.git  OR  https://github.com/owner/repo.git
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)(\.git)?/)
    if (!match) throw new Error(`Could not parse GitHub repo from remote: ${remote}`)
    return { owner: match[1], repo: match[2] }
}

export async function getRepoFromRemote(): Promise<{ owner: string; repo: string }> {
    const remote = await getRemote()
    return parseRepo(remote)
}

/** List open PRs for owner/repo, optionally filtered by branch */
export async function listPullRequests(
    owner: string,
    repo: string,
    branch?: string
): Promise<PullRequest[]> {
    const branchFilter = branch ? `&head=${owner}:${branch}` : ""
    const data = await githubApi(`repos/${owner}/${repo}/pulls?state=open${branchFilter}`)
    return data as unknown as PullRequest[]
}

/** Get a single PR by number */
export async function getPullRequest(
    owner: string,
    repo: string,
    prNumber: number
): Promise<PullRequest> {
    const data = await githubApi(`repos/${owner}/${repo}/pulls/${prNumber}`)
    return data as unknown as PullRequest
}

/** Get check runs for a PR (via its head SHA) */
export async function getCheckRuns(
    owner: string,
    repo: string,
    ref: string
): Promise<CheckRun[]> {
    const data = await githubApi(`repos/${owner}/${repo}/commits/${ref}/check-runs`) as any
    return (data?.check_runs ?? []) as CheckRun[]
}
