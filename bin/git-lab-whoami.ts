#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { whoami, type User } from "../lib/gitlab/user"
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
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
