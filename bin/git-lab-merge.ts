#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import todo from './git-lab-merge-todo'
import active from './git-lab-merge-active'
import history from './git-lab-merge-history'
import train from './git-lab-merge-train'

const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('merge')
        .description('Commands for working with GitLab merge requests')
        .addCommand(active())
        .addCommand(history())
        .addCommand(todo())
        .addCommand(train())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab-merge')) {
    await create().parseAsync(Bun.argv)
}
