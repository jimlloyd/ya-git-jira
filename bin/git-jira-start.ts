#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { createBranch } from "../lib/git"
import { getIssue } from "../lib/jira"
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

function toKebab(s: string): string {
    return s.replace(/([a-z]+)([A-Z]+)/g, "$1_2").toLowerCase()
        .replace(/(\W+)/g, "-")
        .replace(/-$/, "")
}

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('start')
        .description('Start working on an issue by creating a branch')
        .argument('issue', 'Issue ID')
        .action(async (issueId: string) => {
            const issue = await getIssue(issueId)
            if (!issue) {
                console.error(`Issue ${issueId} not found`)
                process.exit(1)
            }
            const summary = issue.fields.summary

            const branchName = `${issueId}-${toKebab(summary)}`
            await createBranch(branchName)
        })

    return program
}

export default create

if (isMain('git-jira-start')) {
    await create().parseAsync(Bun.argv)
}
