#!/usr/bin/env bun run

import { Command } from 'commander'
import { createBranch } from "../lib/git"
import { getIssue } from "../lib/jira"
import { isMain } from '../lib/is_main'

function toKebab(s: string): string {
    return s.replace(/([a-z]+)([A-Z]+)/g, "$1_2").toLowerCase()
        .replace(/(\W+)/g, "-")
        .replace(/-$/, "")
}

export function create(): Command {
    const program = new Command()
    program
        .name('start')
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

if (isMain('git-jira-issues')) {
    create().parse(process.argv)
}

export default create
