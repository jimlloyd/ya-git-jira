#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getMyMergeRequestsInProgress, getPendingMergeRequests } from "../lib/gitlab"
import { isMain } from '../lib/is_main'
import { renderYaml } from '../lib/json'
import { isEpicOrRelease } from '../lib/git/commit-type'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('active')
        .description('List MRs in progress')
        .option('-v, --verbose', 'Verbose output')
        .option('-m, --mine', 'Show only my open MRs')
        .action(async (options) => {
            let merges = await (options.mine ? getMyMergeRequestsInProgress() : getPendingMergeRequests());
            if (!merges) {
                console.error(`No MRs!`)
                process.exit(1)
            }
            merges = merges.filter(m => isEpicOrRelease(m.target_branch))
            if (options.verbose) {
                renderYaml(merges)
                process.exit(0)
            }
            else {
                const filtered = merges.map(m => {
                    const { title, web_url, source_branch, target_branch } = m
                    return { title, web_url, source_branch, target_branch }
                })
                renderYaml(filtered)
            }
        })
    return program
}

export default create

if (isMain('git-lab-merge-active')) {
    await create().parseAsync(Bun.argv)
}
