#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import { MergeData, extractFullMergeHistory, renderGitGraph } from '../lib/git/git-ancestry'

const version = await getPackageVersion()

const preamble: string = `<pre class="mermaid">`;

const postamble: string = `</pre>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
</script>`;

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('youarehere')
        .description('Serve a web page with a git graph of release & epic branches')
        .action(async () => {
            const all: MergeData[] = await extractFullMergeHistory();
            const graph: string = renderGitGraph(all);
            const body: string = [preamble, graph, postamble].join("\n");
            const hostname = 'localhost'
            const server = Bun.serve({
                development: true,
                port: 0,
                hostname,
                fetch(req) {
                    return new Response(body, {
                        headers: { "Content-Type": "text/html" },
                    });
                },
            })
            const port = server.port
            console.log(`Serving at http://${hostname}:${port}`)
        })
    return program
}

export default create

if (isMain('git-lab-youarehere')) {
    await create().parseAsync(Bun.argv)
}
