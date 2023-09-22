#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import { briefly_list, getMergeTrains } from '../lib/gitlab/merge-trains'
import { renderYaml } from '../lib/json'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .option('-v, --verbose', 'Verbose output')
        .description('List merge trains for the current project')
        .action(async (options) => {
            const trains = await getMergeTrains()
            if (options.verbose) {
                renderYaml(trains)
            } else {
                renderYaml(briefly_list(trains))
            }
        })
    return program
}

export default create

if (isMain('git-lab-merge-train-list')) {
    await create().parseAsync(Bun.argv)
}
