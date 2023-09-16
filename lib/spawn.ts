

export async function doCommand(args: string[]): Promise<string> {
    const proc = Bun.spawn(args)
    const stdout = new Response(proc.stdout)
    const stderr = new Response(proc.stderr)
    const [out, err] = await Promise.all([stdout.text(), stderr.text()])
    if (err) console.error(err)
    return out.trim()
}
