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
        .action(async (issueId: string, options) => {
            const issue = await getIssue(issueId)
            if (!issue) {
                console.error(`Issue ${issueId} not found`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(issue)
            } else {
                const { host } = await getJiraConfig()
                const summary = issue.fields.summary
                const url = `https://${host}/browse/${issueId}`
                console.log({ issueId, summary, url })
            }
        })
    return program
}

export default create

if (isMain('git-jira-issue')) {
    await create().parseAsync(Bun.argv)
}
