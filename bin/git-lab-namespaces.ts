#!/usr/bin/env bun

import { Command } from 'commander'
import { isMain } from '../lib/is_main'
import { getNamespaces } from '../lib/gitlab'

export function create(): Command {
    const program = new Command()
    program
        .name('namespaces')
        .description('List namespaces for the current user')
        .action(async () => {
            const namespaces = await getNamespaces()
            console.log(namespaces)
        })
    return program
}

export default create

if (isMain('git-lab-namespaces')) {
    await create().parseAsync(Bun.argv)
}
