#!/usr/bin/env bun

// This is the root of the CLI. It's job is to parse the command
// from the command line and then call the appropriate subcommand.

import { program } from 'commander'

program
    .executableDir('./bin')
    .command('bump', 'Create a new branch with an incremented version number', { executableFile: 'git-bump' })
    .command('jira', 'A collection of jira utility commands', { executableFile: 'git-jira' })

program
    .action(() => {
        program.help()
    })
    .parse(process.argv)
