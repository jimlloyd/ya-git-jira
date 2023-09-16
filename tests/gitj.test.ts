import { test, expect } from "bun:test"
import { spawn, type SpawnResult } from ".."

test("testing works", async (): Promise<void> => {
    expect(true).toBe(true)
})

test("gitj works", async (): Promise<void> => {
    const { err, code }: SpawnResult = await spawn(["bun", "run", "bin/gitj.ts"])
    expect(err).toMatch("Usage:")
    expect(err).toMatch("Bump the version number in the current branch")
    expect(err).toMatch("A set of commands for working with Jira")
    expect(code).toBeGreaterThan
})
