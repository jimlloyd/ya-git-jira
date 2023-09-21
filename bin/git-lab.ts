#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import groups from './git-lab-group'
import merges from './git-lab-merge'
import namespace from './git-lab-namespace'
import project from './git-lab-project'
import whoami from './git-lab-whoami'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('lab')
        .description('Commands for working with GitLab')
        .addCommand(groups())
        .addCommand(merges())
        .addCommand(namespace())
        .addCommand(project())
        .addCommand(whoami())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab')) {
    await create().parseAsync(Bun.argv)
}
