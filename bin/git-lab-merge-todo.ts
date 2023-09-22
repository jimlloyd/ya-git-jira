#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getMyMergeRequestsToReview, type MergeRequest } from "../lib/gitlab"
import { isMain } from '../lib/is_main'
import { renderYaml } from '../lib/json'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('todo')
        .description('MRs needing my review')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const mrs: MergeRequest[] = await getMyMergeRequestsToReview()
            if (options.verbose) {
                renderYaml(mrs)
            }
            else {
                const filtered = mrs.map(mr => {
                    const { title, web_url, source_branch, target_branch } = mr
                    return { title, web_url, source_branch, target_branch }
                })
                renderYaml(filtered)
            }
        })
    return program
}

export default create

if (isMain('git-lab-merge-todo')) {
    await create().parseAsync(Bun.argv)
}
