#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import ancestry from './git-lab-project-ancestry'
import list from './git-lab-project-list'
import whereami from './git-lab-project-whereami'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('project')
        .description('Commands for working with GitLab projects')
        .addCommand(ancestry())
        .addCommand(list())
        .addCommand(whereami())
        .action(() => {
            program.help()
        })
    return program
}

export default create

if (isMain('git-lab-project')) {
    await create().parseAsync(Bun.argv)
}
