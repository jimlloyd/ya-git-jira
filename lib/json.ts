import { stringify } from 'yaml'

export type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>

export function renderYaml(val: JSONValue): void
{
    console.log(stringify(val))
}
