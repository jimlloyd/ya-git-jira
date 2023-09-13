#!/usr/bin/env bun

// This is the root for the jira commands CLI. It's job is to parse the command
// from the command line and then call the appropriate jira subcommand.

import { program } from 'commander'

program
    .command('start', 'Create a new branch for a given Jira issue')

program
    .action(() => {
        program.help()
    })
    .parse(process.argv)
