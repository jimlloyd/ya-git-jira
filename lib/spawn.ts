import { Subprocess } from "bun"

export interface SpawnResult {
    out: string
    err: string
    code: number
}

export interface SpawnOptions {
    expectQuiet?: boolean
}

const defaultOptions: SpawnOptions = {
    expectQuiet: false,
}

export async function spawn(args: string[], options: SpawnOptions = defaultOptions): Promise<SpawnResult> {
    const proc: Subprocess<"ignore", "pipe", "pipe"> = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" })
    const stdout = new Response(proc.stdout)
    const stderr = new Response(proc.stderr)
    const [out, err, exitCode, signal] = await Promise.all([stdout.text(), stderr.text(), proc.exitCode, proc.signalCode])
    let code = 0
    if (exitCode === null) {
        code = 127
    } else {
        code = exitCode
    }
    if (!out && !err && !options.expectQuiet) {
        console.warn(`No output from ${args.join(" ")}`)
    }
    return { out: out.trim(), err: err.trim(), code }
}

export async function doCommand(args: string[]): Promise<string> {
    const { out, err } = await spawn(args)
    if (err) console.error(err)
    return out
}
