import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../src/extension';
import * as constants from '../src/constants';
import * as sinon from 'sinon';
import { deploymentCommands, emulatorCommands, toolsCommands, samplesCommands } from '../src/commands';
import { log, watchEnvFiles, getWorkspaceRoot, loadCommands } from '../src/utilities';
import fs = require('fs');
const fsP = fs.promises;

suite('Extension Loading Tests', function(): void {
    teardown((): void => {
        sinon.restore();
    });
    test("Should Properly Activate the Extension", async function(): Promise<void> {
        const context: vscode.ExtensionContext = {
            subscriptions: [],
        } as any;
        
        // Prevent throwing for registering already-registered commands
        sinon.replace(vscode.commands, 'registerCommand',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable => {
                const disposable: vscode.Disposable = {
                    dispose: (): void => {},
                };
                return disposable;
            });

        await extension.activate(context);

        assert(context.subscriptions.length > 0);
    });
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
    test("Should Load Commands Without Throwing", async function(): Promise<void> {
        const context: vscode.ExtensionContext = {
            subscriptions: [],
        } as any;
        
        // Prevent throwing for registering already-registered commands
        sinon.replace(vscode.commands, 'registerCommand',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable => {
                const disposable: vscode.Disposable = {
                    dispose: (): void => {},
                };
                return disposable;
            });

        await loadCommands(context);

        assert(context.subscriptions.length > 0);
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
            await fsP.writeFile(`${ root }\\${ constants.files.settings.Node }`, data);
            await fsP.writeFile(`${ root }\\${ constants.files.settings.Csharp }`, data);
        } catch(err) {
            assert.fail(err);
        }
    });
});