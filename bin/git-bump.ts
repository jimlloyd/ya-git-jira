#!/usr/bin/env bun

import { createBranch, getCurrentBranch } from "../lib/git"
import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('bump')
        .description('Bump the version number in the current branch')
        .action(async () => {
            const currentBranch = await getCurrentBranch()

            let stem = currentBranch
            let version = 1

            const match = currentBranch.match(/^(.+)[-\.]v(\d+)$/)
            if (match) {
                stem = match[1]
                version = parseInt(match[2]) + 1
            }

            const nextBranch = `${stem}.v${version}`
            await createBranch(nextBranch)
        })
    return program
}

export default create

if (isMain('git-bump')) {
    await create().parseAsync(Bun.argv)
}
