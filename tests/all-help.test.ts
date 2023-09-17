import { readdirSync } from 'fs';
import { describe, expect, test } from 'bun:test';
import { doCommand } from '..';

describe('bin scripts', () => {
    const binDir = './bin';

    const scripts = readdirSync(binDir).filter((file) => {
        return file.endsWith('.ts');
    });

    scripts.forEach((script) => {
        const stem = script.split('/').pop()?.split('-').pop()?.split('.').shift();
        test(`"${script} --help" should contain 'Usage: ${stem}'"`, async () => {
            const output = await doCommand(['bun', 'run', `${binDir}/${script}`, '--help']);
            expect(output).toContain(`Usage: ${stem}`);
        });
    });
});
