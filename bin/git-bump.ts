#!/usr/bin/env bun

import { createBranch, getCurrentBranch } from "../lib/git"
import { program } from 'commander'

program
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
    .parse(process.argv)
