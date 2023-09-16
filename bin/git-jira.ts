#!/usr/bin/env bun run

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

const start = (await import('./git-jira-start')).create()
const issue = (await import('./git-jira-issue')).create()
const issues = (await import('./git-jira-issues')).create()

export function create() {
    const program = new Command()
    program
        .name('jira')
        .addCommand(start)
        .addCommand(issue)
        .addCommand(issues)
        .action(() => {
            program.help()
        })
    return program
}

if (isMain('git-jira')) {
    create().parse(process.argv)
}

export default create
