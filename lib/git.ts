import { doCommand } from "./spawn"

export async function getConfig(key: string): Promise<string> {
    return doCommand(["git", "config", "--get", key])
}

export async function createBranch(name: string): Promise<string> {
    return doCommand(["git", "checkout", "-b", name])
}

export async function getCurrentBranch(): Promise<string> {
    return doCommand(["git", "rev-parse", "--abbrev-ref", "HEAD"])
}
