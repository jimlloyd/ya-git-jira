import type { JSONValue } from "../json"
import { getGithubConfig } from "./config"

const BASE = "https://api.github.com"

export async function githubApi(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
    body?: unknown
): Promise<JSONValue> {
    if (endpoint.startsWith("/")) {
        endpoint = endpoint.slice(1)
    }
    const { token } = await getGithubConfig()
    const headers = new Headers({
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    })

    const options: RequestInit = {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    }

    // Handle pagination for GET requests
    if (method === "GET") {
        const sep = endpoint.includes("?") ? "&" : "?"
        const uri = `${BASE}/${endpoint}${sep}per_page=100`
        const response = await fetch(new Request(uri, options))
        if (!response.ok) {
            const text = await response.text()
            throw new Error(`GitHub API ${endpoint} failed (${response.status}): ${text}`)
        }
        const data = await response.json()
        if (!Array.isArray(data)) {
            return data as JSONValue
        }
        // Paginate via Link header
        let result: Array<JSONValue> = data
        let nextLink = getNextLink(response.headers.get("Link"))
        while (nextLink) {
            const nextResp = await fetch(new Request(nextLink, options))
            if (!nextResp.ok) break
            const nextData = (await nextResp.json()) as Array<JSONValue>
            result = result.concat(nextData)
            nextLink = getNextLink(nextResp.headers.get("Link"))
        }
        return result
    } else {
        const uri = `${BASE}/${endpoint}`
        const response = await fetch(new Request(uri, options))
        if (!response.ok) {
            const text = await response.text()
            throw new Error(`GitHub API ${endpoint} failed (${response.status}): ${text}`)
        }
        if (response.status === 204) return null
        return (await response.json()) as JSONValue
    }
}

function getNextLink(link: string | null): string | undefined {
    if (!link) return undefined
    const match = link.match(/<([^>]+)>;\s*rel="next"/)
    return match ? match[1] : undefined
}
