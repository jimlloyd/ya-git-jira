import { BuildOutput } from 'bun'
import { glob } from 'glob'

const result: BuildOutput = await Bun.build({
    entrypoints: ['./index.ts', ...glob.sync('./bin/*.ts')],
    outdir: './dist',
    target: 'bun',
})

if (!result.success) {
    console.error('Bundle build failed')
    console.log(result)
    process.exit(1)
}

const compiled: BuildOutput = await Bun.build({
    entrypoints: ['./bin/gitj.ts'],
    compile: {
        target: 'bun-linux-x64',
        outfile: './target/gitj',
    },
})

if (!compiled.success) {
    console.error('Compile build failed')
    console.log(compiled)
    process.exit(1)
}

console.log('Build succeeded')
process.exit(0)
