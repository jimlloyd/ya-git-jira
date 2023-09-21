import { doCommand, defaultOptions } from "./spawn"

export async function getConfig(key: string, options = defaultOptions): Promise<string> {
    return doCommand(["git", "config", "--get", key], options)
}

export async function createBranch(name: string): Promise<string> {
    return doCommand(["git", "checkout", "-b", name])
}

export async function getCurrentBranch(): Promise<string> {
    return doCommand(["git", "rev-parse", "--abbrev-ref", "HEAD"])
}

export async function getRemote(): Promise<string> {
    return doCommand(['git', "ls-remote", "--get-url", "origin"])
}
