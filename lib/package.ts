
import path from 'node:path'
import fs from 'node:fs'

export function findPackageJson()
{
    const cwd = import.meta.dir
    let dir = cwd
    while (dir !== '/') {
        const packageJson = path.join(dir, 'package.json')
        if (fs.existsSync(packageJson)) {
            return packageJson
        }
        dir = path.dirname(dir)
    }
    return null
}

export async function getPackageJson()
{
    const packagePath = findPackageJson()
    if (!packagePath) {
        throw new Error(`No package.json found in ${import.meta.dir} or any parent directory`)
    }
    const packageJsonText = fs.readFileSync(packagePath, 'utf8')
    return JSON.parse(packageJsonText)
}

const packageJsonPromise = getPackageJson()

export async function getPackageVersion()
{
    const packageJson = await packageJsonPromise
    return packageJson.version
}
