import { readdirSync } from 'fs';
import { describe, expect, test } from 'bun:test';
import { doCommand } from '..';

import { getPackageJson, getPackageVersion } from '../lib/package'
const version = await getPackageVersion()


describe('bin scripts', () => {
    const binDir = './bin';

    const scripts = readdirSync(binDir).filter((file) => {
        return file.endsWith('.ts');
    });

    describe('--help', () => {
        scripts.forEach((script) => {
            const stem = script.split('/').pop()?.split('-').pop()?.split('.').shift();
            test(`"${script} --help" should contain 'Usage: ${stem}'"`, async () => {
                const output = await doCommand(['bun', 'run', `${binDir}/${script}`, '--help']);
                expect(output).toContain(`Usage: ${stem}`);
            });
        });
    });

    describe('--version', () => {
        scripts.forEach((script) => {
            test(`"${script} --version" should contain '${version}'"`, async () => {
                const output = await doCommand(['bun', 'run', `${binDir}/${script}`, '--version']);
                expect(output).toContain(version);
            });
        });
    });

    describe('all bin/* exist in package.json', async () => {
        const packageJson = await getPackageJson();
        const bin = packageJson.bin;
        scripts.forEach((script) => {
            test(`"${script}" should be in package.json`, () => {
                expect(script).toEndWith('.ts')
                script = script.slice(0, -3)
                expect(bin[script]).toBeDefined();
            });
        });
    })
});
