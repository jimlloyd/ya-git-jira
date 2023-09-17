#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

import groups from './git-lab-groups'
import merges from './git-lab-merges'
import namespaces from './git-lab-namespaces'
import projects from './git-lab-projects'
import whoami from './git-lab-whoami'

export function create(): Command {
    const program = new Command()
    program
        .name('lab')
        .description('A set of commands for working with GitLab')
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
