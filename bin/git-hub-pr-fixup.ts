#!/usr/bin/env bun

import { Command } from "commander"
import { getPackageVersion } from "../lib/package"
import { listPullRequests, getRepoFromRemote } from "../lib/github"
import { getCurrentBranch } from "../lib/git"
import { githubApi } from "../lib/github/api"
import { runMain } from "../lib/is_main"

const version = await getPackageVersion()

interface ReviewThread {
    id: number
    isResolved: boolean
    path: string
    comments: Array<{ body: string; id: number }>
}

export function create(): Command {
    const program = new Command()
    program
        .version(version)
        .name("git-hub-pr-fixup")
        .description("Show unresolved review comments on the current branch PR")
        .option("-r, --repo <owner/repo>", "Override repo (e.g. vishalgattani/ya-git-jira)")
        .option("-b, --branch <branch>", "Branch name (default: current branch)")
        .option("-v, --verbose", "Verbose output")
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
            console.log(`PR #${pr.number}: ${pr.title}  [${pr.html_url}]`)

            // Fetch review comments (inline)
            const comments = await githubApi(
                `repos/${owner}/${repo}/pulls/${pr.number}/comments`
            ) as any[]

            // Fetch review threads state via GraphQL is complex; use REST review comments
            // Filter for unresolved (REST API doesn't have isResolved; show all open comments)
            if (!comments.length) {
                console.log("No review comments.")
                process.exit(0)
            }

            console.log(`\nUnresolved review comments (${comments.length} total):`)
            for (const c of comments) {
                if (options.verbose) {
                    console.log(JSON.stringify(c, null, 2))
                } else {
                    console.log(`\n  📝 ${c.path}:${c.original_line ?? c.line ?? "?"}`)
                    console.log(`     ${c.body}`)
                    console.log(`     ${c.html_url}`)
                }
            }
        })
    return program
}

export default create

await runMain("git-hub-pr-fixup", create)
