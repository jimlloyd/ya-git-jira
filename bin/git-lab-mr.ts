#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import todo from './git-lab-mr-todo'

export function create(): Command {
    const program = new Command()
    program
        .name('mr')
        .description('A set of commands for working with GitLab merge requests')
        .addCommand(todo())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab-mr')) {
    await create().parseAsync(Bun.argv)
}
