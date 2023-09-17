#!/usr/bin/env bun

import { Command } from 'commander'
import { getIssue } from "../lib/jira"
import { isMain } from '../lib/is_main'
import { getJiraConfig } from '../lib/jira'

export function create(): Command {
    const program = new Command()
    program
        .name('issue')
        .description('Get information about an issue')
        .argument('issue', 'Issue ID')
        .option('-v, --verbose', 'Verbose output')
        .option('-u, --url', 'Show the URL of the issue')
        .action(async (issueId: string, options) => {
            const { host } = await getJiraConfig()
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
                console.log(`https://${host}/browse/${issueId}`)
            }
        })
    return program
}

export default create

if (isMain('git-jira-issue')) {
    await create().parseAsync(Bun.argv)
}
