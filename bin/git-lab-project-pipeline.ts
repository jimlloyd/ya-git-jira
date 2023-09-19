#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import list from './git-lab-project-pipeline-list'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('pipeline')
        .description('Commands for working with GitLab pipelines')
        .addCommand(list())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-lab-project-pipeline')) {
    await create().parseAsync(Bun.argv)
}
