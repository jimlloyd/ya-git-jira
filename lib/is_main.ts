import path from 'node:path'
export function isMain(self: string): boolean {
    const exe = path.basename(Bun.argv[1]).split('.')[0]
    return exe == self || import.meta.main
}
