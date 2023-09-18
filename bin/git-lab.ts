#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import groups from './git-lab-group'
import merges from './git-lab-merge'
import namespaces from './git-lab-namespace'
import projects from './git-lab-project'
import whoami from './git-lab-whoami'

export function create(): Command {
    const program = new Command()
    program
        .name('lab')
        .description('Commands for working with GitLab')
        .addCommand(groups())
        .addCommand(merges())
        .addCommand(namespaces())
        .addCommand(projects())
        .addCommand(whoami())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab')) {
    await create().parseAsync(Bun.argv)
}
