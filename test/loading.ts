import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../src/extension';
import * as constants from '../src/constants';
import { deploymentCommands, emulatorCommands } from '../src/commands';
import { log, watchEnvFiles, getWorkspaceRoot } from '../src/utilities';
import fs = require('fs');

suite('Extension Loading Tests', function(): void {
    test('Should Activate and Deactivate extension without throwing', async function(): Promise<void> {
        assert.doesNotThrow(extension.activate);
        assert.doesNotThrow(await extension.deactivate);
    });
    test('Should properly load all commands', async function(): Promise<void> {
        const allCommands = [
            deploymentCommands,
            emulatorCommands
        ];
        const loadedCommands = await vscode.commands.getCommands(true);
        const commandObj = {};
        loadedCommands.forEach((command): void => {
            commandObj[command] = true;
        });
        allCommands.forEach((commandSet): void => {
            for (const key in commandSet) {
                assert.notEqual(commandObj[`extension.${ key }`], undefined, `${ key } could not be loaded.`);
            }
        });
    });
    test('Should not throw when writing text to extension output', async function(): Promise<void> {
        assert.doesNotThrow((): void => {
            log(`Test text`);
        });
    });
    test('Should not throw when watching env files or when files change', async function(): Promise<void> {
        assert.doesNotThrow((): void => {
            watchEnvFiles();
            const root = getWorkspaceRoot();
            const data = JSON.stringify({ test: 'test' });
            fs.writeFileSync(`${ root }\\${ constants.settingsFiles.Node }`, data);
            fs.writeFileSync(`${ root }\\${ constants.settingsFiles.Csharp }`, data);
        });
    });
});