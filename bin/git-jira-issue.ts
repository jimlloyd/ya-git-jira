#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import list from './git-jira-issue-list'
import show from './git-jira-issue-show'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('issue')
        .description('Commands for working with issues')
        .addCommand(list())
        .addCommand(show())
        .action(() => program.help()
        )
    return program
}

export default create

if (isMain('git-jira-issue')) {
    await create().parseAsync(Bun.argv)
}
