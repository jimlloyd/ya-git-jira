#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('train')
        .description('Commands for working with GitLab merge trains (Not yet implemented)')
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab-merge-train')) {
    await create().parseAsync(Bun.argv)
}
