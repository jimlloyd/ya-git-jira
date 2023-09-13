#!/usr/bin/env bun

import { program } from 'commander'
import { myUnresolvedIssues } from "../lib/jira"

program
    .action(async (options) => {

        const issues = await myUnresolvedIssues()
        console.log(`You have ${issues.length} unresolved issues`)
        issues.forEach(issue => {
            console.log(`${issue.key}: ${issue.fields.summary}`)
        })
    })
    .parse(process.argv)
