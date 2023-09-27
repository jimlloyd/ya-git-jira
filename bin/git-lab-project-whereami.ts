#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { findProject } from "../lib/gitlab/project"
import { getAncestry, getCurrentBranch, getRemote } from '../lib/git'
import { isMain } from '../lib/is_main'
import { renderYaml } from '../lib/json'

const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('whereami')
        .description('Show current project based on current directory')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const ssh_url = await getRemote();
            if (!ssh_url) {
                console.error(`No remote!`)
                process.exit(1)
            }
            const project = await findProject(ssh_url);
            if (!project) {
                console.error(`No project!`)
                process.exit(1)
            }
            const branch = await getCurrentBranch()
            const ancestry = await getAncestry()
            if (options.verbose) {
                renderYaml({project, ancestry})
            } else {
                const { id, name, path_with_namespace, ssh_url_to_repo } = project
                const output = {id, name, path_with_namespace, ssh_url_to_repo, branch,}
                renderYaml({project: output, ancestry})
            }
        })
    return program
}

export default create

if (isMain('git-lab-project-whereami')) {
    await create().parseAsync(Bun.argv)
}
