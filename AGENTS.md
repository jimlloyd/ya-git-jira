# AGENTS.md — ya-git-jira

Agent rules and context for working in this repo.
Full documentation and task history live in the Obsidian vault:
`~/Desktop/github/my-brain-in-logseq/projects/ya-git-jira.md`

---

## Project

Fork of [jimlloyd/ya-git-jira](https://github.com/jimlloyd/ya-git-jira).
Git extensions for Jira, GitLab, and Confluence via the `gitj` CLI.

**Upstream:** `git remote add upstream git@github.com:jimlloyd/ya-git-jira.git`

## Rules

- Never commit secrets or API tokens — use git config or `.env` only.
- Commit messages: lowercase, imperative (add X, fix Y).
- Never force push to main.
- To sync with upstream: `git fetch upstream && git rebase upstream/main`
- Documentation → vault at `my-brain-in-logseq/projects/ya-git-jira.md`
