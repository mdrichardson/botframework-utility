import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../src/extension';
import * as constants from '../src/constants';
import { deploymentCommands, emulatorCommands } from '../src/commands';
import { log, watchEnvFiles, getWorkspaceRoot, loadCommands } from '../src/utilities';
import fs = require('fs');
const fsP = fs.promises;

suite('Extension Loading Tests', function(): void {
    test('Should properly load all commands', async function(): Promise<void> {
        assert.doesNotThrow(loadCommands);
    });
    test('Should not throw when writing text to extension output', async function(): Promise<void> {
        assert.doesNotThrow((): void => {
            log(`Test text`);
        });
    });
    test('Should not throw when watching env files or when files change', async function(): Promise<void> {
        try {
            const root = getWorkspaceRoot();
            const data = JSON.stringify({ test: 'test' });
            watchEnvFiles();
            await fsP.writeFile(`${ root }\\${ constants.settingsFiles.Node }`, data);
            await fsP.writeFile(`${ root }\\${ constants.settingsFiles.Csharp }`, data);
        } catch {
            assert.fail();
        }
    });
});