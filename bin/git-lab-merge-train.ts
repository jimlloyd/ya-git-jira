#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

export function create(): Command {
    const program = new Command()
    program
        .name('train')
        .description('Commands for working with GitLab merge trains')
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab-merge-train')) {
    await create().parseAsync(Bun.argv)
}
