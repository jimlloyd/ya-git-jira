import { glob } from 'glob'

await Bun.build({
    entrypoints: ['./index.ts', ...glob.sync('./bin/*.ts')],
    outdir: './dist',
    target: 'bun'
})
