#!/usr/bin/env bun

import { Command } from "commander"
import { getPackageVersion } from "../lib/package"
import { listWorkflowRuns, getWorkflowJobs, getJobLog, getRepoFromRemote } from "../lib/github"
import { getCurrentBranch } from "../lib/git"
import { runMain } from "../lib/is_main"

const version = await getPackageVersion()

export function create(): Command {
    const program = new Command()
    program
        .version(version)
        .name("git-hub-run-log")
        .description("Fetch failed GitHub Actions run log for the current branch")
        .option("-r, --repo <owner/repo>", "Override repo (e.g. vishalgattani/ya-git-jira)")
        .option("-b, --branch <branch>", "Branch name (default: current branch)")
        .option("-t, --tail <lines>", "Show only the last N lines of the log")
        .option("--run-id <id>", "Specific run ID to fetch")
        .action(async (options) => {
            let owner: string
            let repo: string
            if (options.repo) {
                const parts = options.repo.split("/")
                if (parts.length !== 2) {
                    console.error("--repo must be in owner/repo format")
                    process.exit(1)
                }
                ;[owner, repo] = parts
            } else {
                ;({ owner, repo } = await getRepoFromRemote())
            }

            const branch = options.branch || await getCurrentBranch()
            const runs = await listWorkflowRuns(owner, repo, branch)

            if (!runs.length) {
                console.error(`No workflow runs found for branch '${branch}' in ${owner}/${repo}`)
                process.exit(1)
            }

            // Pick the most recent run (failed preferred)
            const run = runs.find(r => r.conclusion === "failure") ?? runs[0]
            console.error(`Run #${run.id}: ${run.name} — ${run.conclusion ?? run.status}  [${run.html_url}]`)

            const jobs = await getWorkflowJobs(owner, repo, run.id)
            const failedJobs = jobs.filter(j => j.conclusion === "failure")

            if (!failedJobs.length) {
                console.error("No failed jobs found in this run.")
                process.exit(0)
            }

            for (const job of failedJobs) {
                console.error(`\nFailed job: ${job.name}  [${job.html_url}]`)
                const log = await getJobLog(owner, repo, job.id)
                if (options.tail) {
                    const n = parseInt(options.tail, 10)
                    const lines = log.split("\n")
                    process.stdout.write(lines.slice(-n).join("\n"))
                } else {
                    process.stdout.write(log)
                }
            }
        })
    return program
}

export default create

await runMain("git-hub-run-log", create)
