import { getConfig, getRemote } from "./git"
import type { JSONValue } from "./json"
import path from 'node:path'

export interface GitlabConfig {
    host: string
    user: string
    token: string
}

export async function getGitlabConfig(): Promise<GitlabConfig> {
    const host = await getConfig("gitlab.host")
    if (!host) throw new Error("gitlab.host not in git config")
    const user = await getConfig("user.email")
    if (!user) throw new Error("user.email not in git config")
    const token = await getConfig("gitlab.token")
    if (!token) throw new Error("gitlab.token not in git config")
    return { host, user, token }
}

function getNextLink(link: string | null): string | undefined {
    if (!link) {
        return undefined
    }
    const regex = /<([^>]+)>; rel="next"/
    const match = link.match(regex)
    const next = match ? match[1] : undefined
    return next
}

export async function gitlabApi(endpoint: string): Promise<JSONValue> {
    const method = "GET"
    const { host, token } = await getGitlabConfig()
    const base = `https://${host}/api/v4`
    const requested = 100
    const sep = endpoint.includes('?') ? '&' : '?'
    const uri = `${base}/${endpoint}${sep}per_page=${requested}`
    const headers = new Headers()
    headers.append("Accept", "application/json")
    headers.append('Private-Token', token)
    const options = {
        method,
        headers,
    }
    let request = new Request(uri, options)
    const response = await fetch(request)
    let link = getNextLink(response.headers.get('Link'))
    let partial = (await response.json()) as Array<JSONValue>
    let result: Array<JSONValue> = partial
    while (partial.length == requested && link)
    {
        console.info(`Fetching ${link}`)
        let request = new Request(link, options)
        const next_response = await fetch(request)
        link = getNextLink(next_response.headers.get('Link'))
        partial = (await next_response.json()) as Array<JSONValue>
        result = result.concat(partial)
    }
    return result;
}

export type User = JSONValue & {
    id: number
    name: string
    username: string
    email: string
}

export async function whoami(): Promise<User> {
    return await gitlabApi("/user") as User
}

export type Project = JSONValue & {
    id: number
    name: string
    path: string
    path_with_namespace: string
    visibility: string
    ssh_url_to_repo: string
}

export async function getProjects(match: string): Promise<Array<Project>> {
    const projects = await gitlabApi(`/projects?membership=true&simple=true`)
    if (!projects) {
        throw new Error(`No projects!`)
    } else if (!Array.isArray(projects)) {
        console.log(projects)
        throw new Error(`Projects is not an array!`)
    }
    const projs = projects as Array<Project>
    console.log(`Searching within a set of ${projs.length} projects for ${match}`)

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
    const method = "GET"
    const { host, token } = await getGitlabConfig()
    const remote = await getRemote()
    const project = await findProject(remote)
    if (!project) {
        throw new Error(`Could not find project for remote ${remote}`)
    }
    const base = `https://${host}/api/v4/projects/${project.id}`
    const uri = `${base}/${endpoint}`
    const headers = new Headers()
    headers.append("Accept", "application/json")
    headers.append('Private-Token', token)
    const options = {
        method,
        headers,
    }
    const request = new Request(uri, options)
    const response = await fetch(request)
    return await response.json()
}

export async function getMergeRequest(id: string): Promise<JSONValue> {
    return await projectScopedGet(`/merge_requests/${id}`)
}
