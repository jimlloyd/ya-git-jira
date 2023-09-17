import { BuildOutput } from 'bun'
import { glob } from 'glob'

const result: BuildOutput = await Bun.build({
    entrypoints: ['./index.ts', ...glob.sync('./bin/*.ts')],
    outdir: './dist',
    target: 'bun'
})

if (result.success) {
    console.log('Build succeeded')
    process.exit(0)
} else {
    console.error('Build failed')
    console.log(result)
    process.exit(1)
}
