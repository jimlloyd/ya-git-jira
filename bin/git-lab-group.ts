#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

import list from './git-lab-group-list'

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('group')
        .description('Commands for working with GitLab groups')
        .addCommand(list())
        .action(() => program.help())
        return program
}

export default create

if (isMain('git-lab-group')) {
    await create().parseAsync(Bun.argv)
}
