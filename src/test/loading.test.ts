import * as assert from 'assert';
import * as vscode from 'vscode';

import { deploymentCommands, emulatorCommands, testCommands } from '../commands/index';

suite("Extension Loading Tests", function(): void {

    // Defines a Mocha unit test
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