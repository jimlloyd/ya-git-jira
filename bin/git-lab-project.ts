#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import list from './git-lab-project-list'
import whereami from './git-lab-project-whereami'

export function create(): Command {
    const program = new Command()
    program
        .name('projects')
        .description('Commands for working with GitLab projects')
        .addCommand(list())
        .addCommand(whereami())
        .action(() => {
            program.help()
        })
    return program
}

export default create

if (isMain('git-lab-project')) {
    await create().parseAsync(Bun.argv)
}
