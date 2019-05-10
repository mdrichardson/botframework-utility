import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../src/extension';

import { deploymentCommands, emulatorCommands, testCommands } from '../src/commands/index';

suite("Extension Loading Tests", function(): void {
    test("Should Load Extension Without Throwing", async function(): Promise<void> {
        assert.doesNotThrow(extension.activate);
        assert.doesNotThrow(extension.deactivate);
    });
    test("Should Properly Load All Commands", async function(): Promise<void> {
        const allCommands = [
            deploymentCommands,
            emulatorCommands,
            testCommands
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
});