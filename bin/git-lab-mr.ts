#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import todo from './git-lab-mr-todo'

export default function create(): Command {
    const program = new Command()
    program
        .name('mr')
        .description('A set of commands for working with GitLab merge requests')
        .addCommand(todo())
        .action(() => program.help())
    return program
}

if (isMain(import.meta.file)) {
    await create().parseAsync(Bun.argv)
}
