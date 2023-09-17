#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'
import start from './git-jira-start'
import issue from './git-jira-issue'
import issues from './git-jira-issues'

export function create(): Command {
    const program = new Command()
    program
        .name('jira')
        .description('A set of commands for working with Jira')
        .addCommand(start())
        .addCommand(issue())
        .addCommand(issues())
    return program
}

export default create

if (isMain('git-jira')) {
    await create().parseAsync(Bun.argv)
}
