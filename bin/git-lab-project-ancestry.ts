#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getAncestry } from '../lib/git'
import { isMain } from '../lib/is_main'
import { renderYaml } from '../lib/json'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('ancestry')
        .description('Show the mainline ancestry of the current commit')
        .action(async () => {
            const ancestry = await getAncestry()
            renderYaml(ancestry)
        })
    return program
}

export default create

if (isMain('git-lab-project-ancestry')) {
    await create().parseAsync(Bun.argv)
}
