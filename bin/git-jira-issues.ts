#!/usr/bin/env bun

import { Command } from 'commander'
import { myUnresolvedIssues } from "../lib/jira"
import { isMain } from '../lib/is_main'

export default function create(): Command {
    const program = new Command()
    program
        .name('issues')
        .description('List your unresolved issues')
        .action(async (options) => {
            const issues = await myUnresolvedIssues()
            console.log(`You have ${issues.length} unresolved issues`)
            issues.forEach(issue => {
                console.log(`${issue.key}: ${issue.fields.summary}`)
            })
        })
    return program
}

if (isMain(import.meta.file)) {
    await create().parseAsync(Bun.argv)
}
