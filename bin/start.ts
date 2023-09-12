#!/usr/bin/env bun

import { getIssue, getMyself } from "../lib/jira"

const issue = await getIssue("CTRL-2011")
console.log(issue.fields.summary)
