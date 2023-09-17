#!/usr/bin/env bun

import { Command } from 'commander'
import { findProject } from "../lib/gitlab"
import { getRemote } from '../lib/git'
import { isMain } from '../lib/is_main'

export default function create(): Command {
    const program = new Command()
    program
        .name('whereami')
        .description('Show current project based on current directory')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const ssh_url = await getRemote();
            const project = await findProject(ssh_url);
            if (!project) {
                console.error(`No project!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(project)
            }
            else {
            const { id, name, path_with_namespace, ssh_url_to_repo } = project
            console.log({id, name, path_with_namespace, ssh_url_to_repo })
            }
        })
    return program
}

if (import.meta.main || import.meta.main || isMain(import.meta.file)) {
    await create().parseAsync(Bun.argv)
}
