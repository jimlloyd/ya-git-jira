#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import { getMergeTrains } from '../lib/gitlab/merge-trains'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List merge trains for the current project')
        .action(async () => {
            const trains = await getMergeTrains()
            console.log(trains)
        })
    return program
}

export default create

if (isMain('git-lab-merge-train-list')) {
    await create().parseAsync(Bun.argv)
}
