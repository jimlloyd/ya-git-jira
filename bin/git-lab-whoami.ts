#!/usr/bin/env bun

import { Command } from 'commander'
import { whoami, type User } from "../lib/gitlab"
import { isMain } from '../lib/is_main'

export function create(): Command {
    const program = new Command()
    program
        .name('whoami')
        .description('get GitLab user information for current user')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const user: User = await whoami()
            if (!user) {
                console.error(`No user!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(user)
                process.exit(0)
            }
            else {
                console.log(user.username)
            }
        })
    return program
}

export default create

if (isMain('git-lab-whoami')) {
    await create().parseAsync(Bun.argv)
}