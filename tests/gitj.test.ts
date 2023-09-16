import { test, expect, describe, beforeEach, afterEach } from "bun:test"
import { getCurrentBranch, spawn, type SpawnResult } from ".."
import cuid from "cuid"

test("testing works", async (): Promise<void> => {
    expect(true).toBe(true)
})

test("gitj works", async (): Promise<void> => {
    const { err, code }: SpawnResult = await spawn(["bun", "run", "bin/gitj.ts"])
    expect(err).toMatch("Usage:")
    expect(err).toMatch("Bump the version number in the current branch")
    expect(err).toMatch("A set of commands for working with Jira")
    expect(code).toBe(0)
})

test("gitj bump --help works", async (): Promise<void> => {
    const { out, code }: SpawnResult = await spawn(["bun", "run", "bin/gitj.ts", "bump", "--help"])
    expect(out).toMatch("Usage:")
    expect(out).toMatch("Bump the version number in the current branch")
    expect(code).toBe(0)
})

describe("gitj bump", (): void => {
    let priorBranch: string
    let testBranch = cuid()
    beforeEach(async (): Promise<void> => {
        priorBranch = await getCurrentBranch()
        await spawn(["git", "checkout", "-b", testBranch])
    })

    test("gitj bump works", async (): Promise<void> => {
        const { code }: SpawnResult = await spawn(["bun", "run", "bin/gitj.ts", "bump"])
        expect(code).toBe(0)
        expect(await getCurrentBranch()).toMatch(testBranch + '.v1')
    })

    afterEach(async (): Promise<void> => {
        await spawn(["git", "checkout", priorBranch])
        await spawn(["git", "branch", "-D", testBranch])
        await spawn(["git", "branch", "-D", testBranch + '.v1'])
    })
})
