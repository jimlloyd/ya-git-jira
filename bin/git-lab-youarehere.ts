#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import { MergeData, extractFullMergeHistory, renderGitGraph } from '../lib/git/git-ancestry'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('youarehere')
        .description('Show an overview of all release & epic branches')
        .action(async () => {
            const all: MergeData[] = await extractFullMergeHistory()
            renderGitGraph(all)
        })
    return program
}

export default create

if (isMain('git-lab-youarehere')) {
    await create().parseAsync(Bun.argv)
}
