#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'
import start from './git-jira-start'
import issue from './git-jira-issue'
import issues from './git-jira-issues'

export default function create(): Command {
    const program = new Command()
    program
        .name('jira')
        .description('A set of commands for working with Jira')
        .addCommand(start())
        .addCommand(issue())
        .addCommand(issues())
    return program
}

if (isMain(import.meta.file)) {
    await create().parseAsync(Bun.argv)
}
