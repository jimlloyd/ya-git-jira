#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import todo from './git-lab-merge-todo'

export function create(): Command {
    const program = new Command()
    program
        .name('merge')
        .description('Commands for working with GitLab merge requests')
        .addCommand(todo())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab-merge')) {
    await create().parseAsync(Bun.argv)
}
