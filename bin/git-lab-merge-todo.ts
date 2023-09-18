#!/usr/bin/env bun

import { Command } from 'commander'
import { getMergeRequestsAssignedToMe, type MergeRequest } from "../lib/gitlab"
import { isMain } from '../lib/is_main'

export function create(): Command {
    const program = new Command()
    program
        .name('todo')
        .description('MRs needing my review')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const mrs: MergeRequest[] = await getMergeRequestsAssignedToMe()
            if (options.verbose) {
                console.log(mrs)
            }
            else {
                const filtered = mrs.map(mr => {
                    const { id, title, web_url, source_branch, target_branch, merge_status } = mr
                    return { id, title, web_url, source_branch, target_branch, merge_status }
                })
                console.log(filtered)
            }
        })
    return program
}

export default create

if (isMain('git-lab-merge-todo')) {
    await create().parseAsync(Bun.argv)
}
