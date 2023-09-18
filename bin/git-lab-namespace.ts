#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import list from './git-lab-namespace-list'

export function create(): Command {
    const program = new Command()
    program
        .name('namespace')
        .description('Commands for working with GitLab namespaces')
        .addCommand(list())
        .action(() => program.help())
        return program
}

export default create

if (isMain('git-lab-namespace')) {
    await create().parseAsync(Bun.argv)
}
