#!/usr/bin/env bun run

import { Command } from 'commander'
import { myUnresolvedIssues } from "../lib/jira"
import { isMain } from '../lib/is_main'

export function create(): Command {
    const program = new Command()
    program
        .name('issues')
        .action(async (options) => {
            const issues = await myUnresolvedIssues()
            console.log(`You have ${issues.length} unresolved issues`)
            issues.forEach(issue => {
                console.log(`${issue.key}: ${issue.fields.summary}`)
            })
        })
    return program
}

if (isMain('git-jira-issues')) {
    create().parse(process.argv)
}

export default create
