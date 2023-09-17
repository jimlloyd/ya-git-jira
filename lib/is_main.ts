import path from 'node:path'

function justBase(filename: string): string {
    const ext = path.extname(filename)
    const base = path.basename(filename, ext)
    return base
}

export function isMain(self: string): boolean {
    const argv1Base = justBase(Bun.argv[1])
    const selfBase = justBase(self)
    const result = argv1Base == selfBase
    // console.log({
    //     argv1Base,
    //     selfBase,
    //     result,
    // })
    return result
}
