#!/usr/bin/env bun

import { Command } from "commander"
import { getPackageVersion } from "../lib/package"
import { listPullRequests, getRepoFromRemote } from "../lib/github"
import { runMain } from "../lib/is_main"

const version = await getPackageVersion()

export function create(): Command {
    const program = new Command()
    program
        .version(version)
        .name("git-hub-pr-list")
        .description("List open pull requests for the current GitHub repo")
        .option("-v, --verbose", "Verbose output")
        .option("-r, --repo <owner/repo>", "Override repo (e.g. vishalgattani/ya-git-jira)")
        .option("-b, --branch <branch>", "Filter by source branch")
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

            const prs = await listPullRequests(owner, repo, options.branch)
            if (!prs.length) {
                console.error(`No open PRs for ${owner}/${repo}${options.branch ? ` on branch ${options.branch}` : ""}`)
                process.exit(0)
            }

            if (options.verbose) {
                console.log(JSON.stringify(prs, null, 2))
            } else {
                const filtered = prs.map(({ number, title, html_url, head, base, state, draft }) => ({
                    number,
                    title,
                    html_url,
                    source_branch: head.ref,
                    target_branch: base.ref,
                    state,
                    draft,
                }))
                console.log(JSON.stringify(filtered, null, 2))
            }
        })
    return program
}

export default create

await runMain("git-hub-pr-list", create)
