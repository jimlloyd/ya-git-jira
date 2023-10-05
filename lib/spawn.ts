import { Subprocess } from "bun"

export interface SpawnResult {
    out: string
    err: string
    code: number
}

export interface SpawnOptions {
    expectQuiet?: boolean
}

export const defaultOptions: SpawnOptions = {
    expectQuiet: false,
}

export async function spawn(args: string[], options: SpawnOptions = defaultOptions): Promise<SpawnResult> {
    const proc: Subprocess<"ignore", "pipe", "pipe"> = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" })
    const stdout = new Response(proc.stdout)
    const stderr = new Response(proc.stderr)
    const [out, err, exitCode, signal] = await Promise.all([stdout.text(), stderr.text(), proc.exitCode, proc.signalCode])
    let code = 0
    if (exitCode !== null) {
        code = exitCode
    }
    if (!out && !err && !options.expectQuiet) {
        console.warn(`No output from ${args.join(" ")}`)
    }
    return { out: out.trim(), err: err.trim(), code }
}

export type ArgsOrString = string | string[]

export async function doCommand(args: ArgsOrString, options: SpawnOptions = defaultOptions): Promise<string> {
    if (typeof args === "string") args = args.split(" ")
    const { out, err } = await spawn(args, options)
    if (err) console.error(`Error: ${err} while running ${args.join(" ")}`)
    return out
}
