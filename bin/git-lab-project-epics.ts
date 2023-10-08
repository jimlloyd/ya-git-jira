#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { Branch, GetRemoteBranchesOptions, getRemoteBranches } from "../lib/gitlab/project"
import { isMain } from '../lib/is_main'
import { renderYaml } from '../lib/json'
import dayjs from 'dayjs'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('epics')
        .description('List remote branches for the current project')
        .option('-v, --verbose', 'Verbose output')
        .option('-s, --search <term>', 'Match branches with paths containing <term>')
        .option('-a, --max-age <max-age>', 'Maximum age of branches in days')
        .action(async (options) => {
            const { search, maxAge } = options
            const getRemoteOptions: GetRemoteBranchesOptions = { search, maxAge }
            let branches: Array<Branch> = await getRemoteBranches(getRemoteOptions)
            if (options.verbose) {
                renderYaml(branches)
            }
            else {
                let filtered = branches.map((b: Branch) => {
                    const { name, commit : { committed_date } } = b
                    return { name, committed_date }
                })
                renderYaml(filtered)
            }
        })
    return program
}

export default create

if (isMain('git-lab-project-epics')) {
    await create().parseAsync(Bun.argv)
}
