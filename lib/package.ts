
import path from 'node:path'
import fs from 'node:fs'
import embeddedPackageJson from '../package.json' with { type: 'file' }

const isCompiled = import.meta.dir.startsWith('/$bunfs')

export function findPackageJson()
{
    if (isCompiled) return embeddedPackageJson
    let dir = import.meta.dir
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
    return Bun.file(packagePath).json()
}

const packageJsonPromise = getPackageJson()

export async function getPackageVersion()
{
    const packageJson = await packageJsonPromise
    return packageJson.version
}
