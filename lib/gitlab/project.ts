import { getGitlabConfig } from "./config"
import { getRemote } from "../git/git-base"
import { gitlabApi } from "./api"
import { type JSONValue } from "../json"
import path from 'node:path'
import { dlog } from "./dlog"
import { MergeRequest } from "./merge-request"
import dayjs from "dayjs"
export type Project = JSONValue & {
    id: number
    name: string
    path: string
    path_with_namespace: string
    visibility: string
    ssh_url_to_repo: string
}

export async function getProjects(match: string): Promise<Array<Project>> {
    let search = ''
    if (match) {
        const m = encodeURIComponent(match)
        search = `&search=${m}`
    }
    const projects = await gitlabApi(`projects?membership=true&simple=true${search}`)
    if (!projects) {
        throw new Error(`No projects!`)
    } else if (!Array.isArray(projects)) {
        console.log(projects)
        throw new Error(`Projects is not an array!`)
    }
    const projs = projects as Array<Project>

    const filtered = projs.filter((p: Project): boolean => {
        return p.path_with_namespace.toLowerCase().includes(match.toLowerCase())
    })
    return filtered
}

// git@gitlab.com:etagen-internal/linear-generator-config.git
export async function findProject(ssh_url: string): Promise<Project | undefined> {
    const parts = ssh_url.split(':')
    if (parts.length != 2) {
        throw new Error(`${ssh_url} is invalid, could not be split into two parts at :`)
    }
    const name = path.basename(parts[1], '.git')

    const projects = await getProjects(name) as Array<Project>
    const project = projects.find((p: Project): boolean => {
        return p.ssh_url_to_repo === ssh_url
    })
    return project
}

export async function projectScopedGet(endpoint: string): Promise<JSONValue> {
    if (endpoint.startsWith("/")) {
        console.warn(`gitlabApi: endpoint ${endpoint} starts with /, removing it`)
        endpoint = endpoint.slice(1)
    }
    const remote = await getRemote()
    const project = await findProject(remote)
    if (!project) {
        throw new Error(`Could not find project for remote ${remote}`)
    }
    if (!endpoint.startsWith("projects/")) {
        endpoint = `projects/${project.id}/${endpoint}`
    }
    return await gitlabApi(endpoint)
}

export async function getPendingMergeRequests() : Promise<Array<MergeRequest>>
{
    return await projectScopedGet(`merge_requests?state=opened`) as Array<MergeRequest>
}

export type Branch = JSONValue & {
    name: string
    commit: {
        committed_date: string
    }
}

export type GetRemoteBranchesOptions = {
    search?: string
    maxAge?: number
}

export async function getRemoteBranches(options: GetRemoteBranchesOptions): Promise<Branch[]> {
    let { search, maxAge } = options

    search = search || '^epic/'
    maxAge = maxAge || 90

    const dateLimit = dayjs().subtract(maxAge, 'day')

    let args = search ? `?search=${encodeURIComponent(search)}` : ''
    let branches = await projectScopedGet(`repository/branches${args}`) as Array<Branch>

    branches = branches
    .filter((b: Branch) => {
        const { commit : { committed_date } } = b
        return dayjs(committed_date).isAfter(dateLimit)
    })
    .sort((a: Branch, b: Branch) => {
        const ad = dayjs(a.commit.committed_date)
        const bd = dayjs(b.commit.committed_date)
        return ad.isAfter(bd) ? -1 : 1  // sort descending
    })

    return branches
}
