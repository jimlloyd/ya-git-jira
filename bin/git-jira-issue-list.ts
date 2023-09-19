#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { myUnresolvedIssues } from "../lib/jira"
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List your unresolved issues')
        .action(async () => {
            const issues = await myUnresolvedIssues()
            console.log(`You have ${issues.length} unresolved issues`)
            issues.forEach(issue => {
                console.log(`${issue.key}: ${issue.fields.summary}`)
            })
        })
    return program
}

export default create

if (isMain('git-jira-issue-list')) {
    await create().parseAsync(Bun.argv)
}
