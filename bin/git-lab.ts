#!/usr/bin/env bun run

import { Command } from 'commander'
import { isMain } from '../lib/is_main'
import whoami from './git-lab-whoami'

export function create(): Command {
    const program = new Command()
    program
        .name('lab')
        .description('A set of commands for working with GitLab')
        .addCommand(whoami())
    return program
}

if (isMain('git-jira')) {
    await create().parseAsync(Bun.argv)
}

export default create
