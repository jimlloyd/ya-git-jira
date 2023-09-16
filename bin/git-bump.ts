#!/usr/bin/env bun run

import { createBranch, getCurrentBranch } from "../lib/git"
import { Command } from 'commander'
import { isMain } from '../lib/is_main'

export function create(): Command {
    const program = new Command()
    program
        .name('bump')
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

if (isMain('git-bump')) {
    create().parse(process.argv)
}

export default create
