import { githubApi } from "./api"

export interface WorkflowRun {
    id: number
    name: string
    status: string
    conclusion: string | null
    html_url: string
    head_branch: string
    head_sha: string
    created_at: string
    updated_at: string
}

export interface WorkflowJob {
    id: number
    name: string
    status: string
    conclusion: string | null
    html_url: string
    steps: Array<{
        name: string
        status: string
        conclusion: string | null
        number: number
    }>
}

/** List workflow runs for a branch */
export async function listWorkflowRuns(
    owner: string,
    repo: string,
    branch?: string
): Promise<WorkflowRun[]> {
    const branchQ = branch ? `&branch=${encodeURIComponent(branch)}` : ""
    const data = await githubApi(`repos/${owner}/${repo}/actions/runs?${branchQ}`) as any
    return (data?.workflow_runs ?? []) as WorkflowRun[]
}

/** Get a single workflow run by ID */
export async function getWorkflowRun(
    owner: string,
    repo: string,
    runId: number
): Promise<WorkflowRun> {
    const data = await githubApi(`repos/${owner}/${repo}/actions/runs/${runId}`)
    return data as unknown as WorkflowRun
}

/** Get jobs for a workflow run */
export async function getWorkflowJobs(
    owner: string,
    repo: string,
    runId: number
): Promise<WorkflowJob[]> {
    const data = await githubApi(`repos/${owner}/${repo}/actions/runs/${runId}/jobs`) as any
    return (data?.jobs ?? []) as WorkflowJob[]
}

/** Download the log for a specific job */
export async function getJobLog(
    owner: string,
    repo: string,
    jobId: number
): Promise<string> {
    const { token } = await import("./config").then(m => m.getGithubConfig())
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`
    const resp = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        redirect: "follow",
    })
    if (!resp.ok) {
        const text = await resp.text()
        throw new Error(`Failed to fetch job log for job ${jobId}: ${resp.status} ${text}`)
    }
    return resp.text()
}
