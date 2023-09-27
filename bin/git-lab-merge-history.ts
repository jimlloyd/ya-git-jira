#!/usr/bin/env bun

import { Command, Option } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getMergeHistory } from '../lib/git/git-ancestry'
import { isMain } from '../lib/is_main'
import { JSONValue, renderYaml } from '../lib/json'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('history')
        .description('Show the merge commits for the given commitish')
        .argument('[commitish]', 'the branch, tag or commit to show history for', 'HEAD')
        .addOption(new Option('--commits [int]', 'the number of merge commits to return').preset('30').argParser(parseInt))
        .action(async (commitish, option) => {
            const history = await getMergeHistory(commitish, option.commits)
            renderYaml(history as unknown as JSONValue)
        })
    return program
}

export default create

if (isMain('git-lab-merge-history')) {
    await create().parseAsync(Bun.argv)
}
