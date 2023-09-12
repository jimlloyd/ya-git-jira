#!/usr/bin/env bun

import minimist from "minimist"
import { createBranch } from "../lib/git"
import { getIssue } from "../lib/jira"

const argv = minimist(process.argv.slice(2))
if (argv._.length !== 1) {
    console.error("Usage: start <issue>")
    process.exit(1)
}

const issueId = argv._[0]
const issue = await getIssue(issueId)
const summary = issue.fields.summary

function toKebab(s: string): string {
    return s.replace(/([a-z]+)([A-Z]+)/g, "$1_2").toLowerCase()
        .replace(/(\W+)/g, "-")
        .replace(/-$/, "")
}

const branchName = `${issueId}-${toKebab(summary)}`
await createBranch(branchName)
