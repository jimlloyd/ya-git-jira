#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import list from './git-lab-group-list'

export function create(): Command {
    const program = new Command()
    program
        .name('group')
        .description('Commands for working with GitLab groups')
        .addCommand(list())
        .action(() => program.help())
        return program
}

export default create

if (isMain('git-lab-group')) {
    await create().parseAsync(Bun.argv)
}
