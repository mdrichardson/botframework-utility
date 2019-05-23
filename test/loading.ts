import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../src/extension';
import * as constants from '../src/constants';
import { deploymentCommands, emulatorCommands, toolsCommands, samplesCommands } from '../src/commands';
import { log, watchEnvFiles, getWorkspaceRoot } from '../src/utilities';
import fs = require('fs');
const fsP = fs.promises;

suite('Extension Loading Tests', function(): void {
    test('Should deactivate then reactivate extension without throwing', async function(): Promise<void> {
        // Extension is automatically activated. We have to deactivate first so that it doesn't throw
        try {
            // Can't call extension.activate without ExtensionContext. This is a good workaround
            const ext = (await vscode.extensions.getExtension('mdrichardson.botframework-utility') as vscode.Extension<any>);
            await extension.deactivate();
            await ext.activate();
        } catch(err) {
            assert.fail(err);
        }
    });
    test('Should have properly loaded all commands', async function(): Promise<void> {
        // We can't call loadCommands directly without context, so we'll just check that each command loaded when the extension activated
        const commands = await vscode.commands.getCommands(true);

        const commandObj = {};
        const allCommands = [
            deploymentCommands,
            emulatorCommands,
            samplesCommands,
            toolsCommands
        ];
        commands.forEach((command): void => {
            commandObj[command] = true;
        });
        allCommands.forEach((commandSet): void => {
            for (const key in commandSet) {
                if (!commandObj[`botframework-utility.${ key }`]) {
                    assert.fail(`${ commandSet[key] } command not loaded`);
                }
            }
        });
    });
    test('Should not throw when writing text to extension output', async function(): Promise<void> {
        assert.doesNotThrow((): void => {
            log(`Test text`);
            log(`More text`, true);
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