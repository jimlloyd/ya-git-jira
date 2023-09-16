#!/usr/bin/env bun run

// This is the root of the CLI. It's job is to parse the command
// from the command line and then call the appropriate subcommand.

import { Command } from 'commander'
import { isMain } from '../lib/is_main'

if (isMain('gitj')) {

    const program = new Command()
    const bump = (await import('./git-bump')).create()

    program
        .executableDir('./bin')
        .addCommand(bump)
        .command('jira', 'A collection of jira utility commands', { executableFile: 'git-jira' })

    program
        .action(() => {
            program.help()
        })
        .parse(Bun.argv)
}
