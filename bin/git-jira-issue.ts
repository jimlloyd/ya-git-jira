#!/usr/bin/env bun run

import { Command } from 'commander'
import { getIssue } from "../lib/jira"
import { isMain } from '../lib/is_main'

export function create() {
    const program = new Command()
    program
        .name('issue')
        .argument('issue', 'Issue ID')
        .option('-v, --verbose', 'Verbose output')
        .option('-u, --url', 'Show the URL of the issue')
        .action(async (issueId: string, options) => {
            const issue = await getIssue(issueId)
            if (!issue) {
                console.error(`Issue ${issueId} not found`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(issue)
                process.exit(0)
            }
            if (options.url) {
                console.log(issue.self)
            }
        })
    return program
}

if (isMain('git-jira-issue')) {
    create().parse(process.argv)
}

export default create
