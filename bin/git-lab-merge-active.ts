#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getMyMergeRequestsInProgress } from "../lib/gitlab"
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('active')
        .description('List my MRs in progress')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const merges = await getMyMergeRequestsInProgress();
            if (!merges) {
                console.error(`No MRs!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(merges)
                process.exit(0)
            }
            else {
                const filtered = merges.map(m => {
                    const { title, web_url, source_branch, target_branch } = m
                    return { title, web_url, source_branch, target_branch }
                })
                console.log(filtered)
            }
        })
    return program
}

export default create

if (isMain('git-lab-merge-active')) {
    await create().parseAsync(Bun.argv)
}
