import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../src/extension';
import { deploymentCommands, emulatorCommands } from '../src/commands';

suite("Extension Loading Tests", function(): void {
    test("Should Load Extension Without Throwing", async function(): Promise<void> {
        assert.doesNotThrow(await extension.activate);
        // Ensure full activate function gets called (for coverage)
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1500));
        assert.doesNotThrow(await extension.deactivate);
    });
    test("Should Properly Load All Commands", async function(): Promise<void> {
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
});