import { gitlabApi } from "./api"
import { JSONValue } from "../json"

type Namespace = JSONValue & {
    id: number
    name: string
    full_path: string
}

export async function getNamespaces(): Promise<Namespace[]> {
    return await gitlabApi(`namespaces`) as Namespace[]
}
