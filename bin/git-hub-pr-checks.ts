#!/usr/bin/env bun

import { Command } from "commander"
import { getPackageVersion } from "../lib/package"
import { listPullRequests, getCheckRuns, getRepoFromRemote } from "../lib/github"
import { getCurrentBranch } from "../lib/git"
import { runMain } from "../lib/is_main"

const version = await getPackageVersion()

export function create(): Command {
    const program = new Command()
    program
        .version(version)
        .name("git-hub-pr-checks")
        .description("Show CI check status for the current branch PR on GitHub")
        .option("-v, --verbose", "Verbose output")
        .option("-r, --repo <owner/repo>", "Override repo (e.g. vishalgattani/ya-git-jira)")
        .option("-b, --branch <branch>", "Branch name (default: current branch)")
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
            const prs = await listPullRequests(owner, repo, branch)

            if (!prs.length) {
                console.error(`No open PRs for branch '${branch}' in ${owner}/${repo}`)
                process.exit(1)
            }

            const pr = prs[0]
            const sha = pr.head.ref  // use sha for checks
            // Get checks via commit SHA — need PR's head sha
            const checks = await getCheckRuns(owner, repo, pr.head.ref)

            if (!checks.length) {
                console.log(`PR #${pr.number}: ${pr.title}`)
                console.log("No check runs found.")
                process.exit(0)
            }

            if (options.verbose) {
                console.log(JSON.stringify(checks, null, 2))
            } else {
                console.log(`PR #${pr.number}: ${pr.title}  [${pr.html_url}]`)
                for (const c of checks) {
                    const icon = c.conclusion === "success" ? "✅"
                        : c.conclusion === "failure" ? "❌"
                        : c.status === "in_progress" ? "🔄"
                        : "⏳"
                    console.log(`  ${icon} ${c.name} — ${c.conclusion ?? c.status}  ${c.html_url}`)
                }
            }
        })
    return program
}

export default create

await runMain("git-hub-pr-checks", create)
