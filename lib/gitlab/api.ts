import type { JSONValue } from "../json"
import { getGitlabConfig } from "./config"

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
    if (endpoint.startsWith("/")) {
        console.warn(`gitlabApi: endpoint ${endpoint} starts with /, removing it`)
        endpoint = endpoint.slice(1)
    }
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
        let request = new Request(link, options)
        const next_response = await fetch(request)
        link = getNextLink(next_response.headers.get('Link'))
        partial = (await next_response.json()) as Array<JSONValue>
        result = result.concat(partial)
    }
    return result;
}
