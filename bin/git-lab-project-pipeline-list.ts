#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getProjectPipelines, type Pipeline } from "../lib/gitlab"
import { isMain } from '../lib/is_main'
import debug from 'debug'
import { renderYaml } from '../lib/json'

const version = await getPackageVersion()
const dlog = debug('git-lab-project-pipeline-list')

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List recent successful pipelines')
        .option('-v, --verbose', 'Verbose output')
        .option('-d, --days <days>', 'Number of days to look back', '7')
        .option('-s, --status <status>', 'Status of pipelines to list: success | runnning | ', 'success')
        .action(async (options) => {
            const pipelines: Array<Pipeline> = await getProjectPipelines(options)
            dlog(`pipelines:`, pipelines)
            if (!pipelines) {
                console.error(`No pipelines!`)
                process.exit(1)
            }
            if (options.verbose) {
                renderYaml(pipelines)
            }
            else {
                let filtered = pipelines.map((p: Pipeline) => {
                    const { id, web_url, updated_at, ref, sha } = p
                    return { id, web_url, updated_at, ref, sha }
                })
                renderYaml(filtered)
            }
        })
    return program
}

export default create

if (isMain('git-lab-project-pipeline-list')) {
    await create().parseAsync(Bun.argv)
}
