#!/usr/bin/env bun

import { Command } from 'commander'
import { getProjects, type Project } from "../lib/gitlab"
import { isMain } from '../lib/is_main'

export default function create(): Command {
    const program = new Command()
    program
        .name('list')
        .description('List projects for current user')
        .option('-v, --verbose', 'Verbose output')
        .argument('[path...]', 'Namespace paths to filter by')
        .action(async (paths: string[], options) => {
            const projects: Array<Project> = await getProjects(paths)
            if (!projects) {
                console.error(`No projects!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(projects)
            }
            else {
                let filtered = projects.map((p: Project) => {
                    const { id, name, path_with_namespace, ssh_url_to_repo } = p
                    return { id, name, path_with_namespace, ssh_url_to_repo }
                })
                console.log(filtered)
            }
        })
    return program
}

if (isMain(import.meta.file)) {
    await create().parseAsync(Bun.argv)
}
