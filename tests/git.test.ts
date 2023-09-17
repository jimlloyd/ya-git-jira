import { test, expect } from "bun:test"
import { findProject, getRemote } from ".."

test("testing works", async (): Promise<void> => {
    expect(true).toBe(true)
})

test("getRemote", async (): Promise<void> => {
    const url = await getRemote()
    expect(url).toBe("git@github.com:jimlloyd/ya-git-jira.git")
})

test("findProject linear-generator", async (): Promise<void> => {
    const ssh_url = "git@gitlab.com:etagen-internal/linear-generator.git"
    const project = await findProject(ssh_url)
    expect(project?.ssh_url_to_repo).toBe(ssh_url)
    expect(project?.id).toBe(4053065)
}, 15000)

test("findProject eta-lib/base", async (): Promise<void> => {
    const ssh_url = "git@gitlab.com:etagen-internal/eta-lib/base.git"
    const project = await findProject(ssh_url)
    expect(project?.ssh_url_to_repo).toBe(ssh_url)
    expect(project?.id).toBe(42470523)
}, 15000)
