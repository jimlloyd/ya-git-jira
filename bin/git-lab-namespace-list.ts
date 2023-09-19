#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import { getNamespaces } from '../lib/gitlab/namespace'

const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List namespaces for the current user')
        .action(async () => {
            const namespaces = await getNamespaces()
            console.log(namespaces)
        })
    return program
}

export default create

if (isMain('git-lab-namespace-list')) {
    await create().parseAsync(Bun.argv)
}
