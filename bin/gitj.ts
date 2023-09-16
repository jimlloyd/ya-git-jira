#!/usr/bin/env bun run

import bump from './git-bump'
import jira from './git-jira'

// This is the root of the CLI. It's a proxy for git and not strictly
// necessary, but it's useful to have for testing
// It's job is to parse the first command
// from the command line and then call the appropriate subcommand.

import { Command } from 'commander'

export function create(): Command {
    const program: Command = new Command()
    program
        .addCommand(bump())
        .addCommand(jira())
    return program
}

const command = create()
await command.parseAsync(Bun.argv)
