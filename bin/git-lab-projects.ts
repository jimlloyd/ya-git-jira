#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import list from './git-lab-projects-list'
import whereami from './git-lab-projects-whereami'

export default function create(): Command {
    const program = new Command()
    program
        .name('projects')
        .description('A set of commands for working with GitLab projects')
        .addCommand(list())
        .addCommand(whereami())
        .action(() => {
            program.help()
        })
    return program
}

if (isMain(import.meta.file)) {
    await create().parseAsync(Bun.argv)
}
