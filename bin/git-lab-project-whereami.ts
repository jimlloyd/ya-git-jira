#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { findProject } from "../lib/gitlab/project"
import { getRemote } from '../lib/git'
import { isMain } from '../lib/is_main'
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
            console.log(`Remote: ${ssh_url}`)
            const project = await findProject(ssh_url);
            if (!project) {
                console.error(`No project!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(project)
            } else {
                const { id, name, path_with_namespace, ssh_url_to_repo } = project
                console.log({id, name, path_with_namespace, ssh_url_to_repo })
            }
        })
    return program
}

export default create

if (isMain('git-lab-project-whereami')) {
    await create().parseAsync(Bun.argv)
}
