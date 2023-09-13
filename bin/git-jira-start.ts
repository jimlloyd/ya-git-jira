#!/usr/bin/env bun

import { program } from 'commander'
import { createBranch } from "../lib/git"
import { getIssue } from "../lib/jira"

function toKebab(s: string): string {
    return s.replace(/([a-z]+)([A-Z]+)/g, "$1_2").toLowerCase()
        .replace(/(\W+)/g, "-")
        .replace(/-$/, "")
}

program
    .argument('<issue>', 'Issue ID')
    .action(async (issueId: string, options) => {

        const issue = await getIssue(issueId)
        if (!issue) {
            console.error(`Issue ${issueId} not found`)
            process.exit(1)
        }
        const summary = issue.fields.summary

        const branchName = `${issueId}-${toKebab(summary)}`
        await createBranch(branchName)
    })
    .parse(process.argv)
