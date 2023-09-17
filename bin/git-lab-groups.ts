#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'
import { getGroups } from '../lib/gitlab'

export function create(): Command {
    const program = new Command()
    program
        .name('groups')
        .description('List groups for the current user')
        .option("-v, --verbose", "Verbose output")
        .action(async (options) => {
            const groups = await getGroups()
            if (options.verbose)
                console.log(groups)
            else {
                const filtered = groups.map(g => {
                    const { id, name, full_path } = g
                    return { id, name, full_path }
                })
                console.log(filtered)
            }
        })
    return program
}

export default create

if (isMain('git-lab-groups')) {
    await create().parseAsync(Bun.argv)
}
