import * as vscode from 'vscode';

import { deploymentCommands, emulatorCommands, testCommands } from './commands/index';
import { syncLocalBotVariablesToEnv } from './utilities/variables';

export async function activate(context: vscode.ExtensionContext): Promise<void> {    
    // Load appsettings.json/.env into env variables
    await syncLocalBotVariablesToEnv();

    // Load commands from each .ts file in ./commands
    const allCommands = [
        deploymentCommands,
        emulatorCommands,
        testCommands
    ];
    allCommands.forEach((commandSet): void => {
        for (const key in commandSet) {
            const command = vscode.commands.registerCommand(`extension.${ key }`, commandSet[key]);
            context.subscriptions.push(command);
        }
    });    

    // Watch .env and appsettings.json for changes
    const envWatcher = vscode.workspace.createFileSystemWatcher('**/.env', true, false, true);
    envWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
    const appsettingsJsonWatcher = vscode.workspace.createFileSystemWatcher('**/appsettings.json', true, false, true);
    appsettingsJsonWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
    
    console.log('BotFramework Utility is now active!');
}

export function deactivate(): void {}
