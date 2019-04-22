// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { commands } from './commands';
import { syncLocalBotVariablesToEnv } from './utilities/variables';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<void> {    
    // Load appsettings.json/.env into env variables
    await syncLocalBotVariablesToEnv();

    // Load commands from commands.ts
    for (const key in commands) {
        const command = vscode.commands.registerCommand(`extension.${ key }`, commands[key]);
        context.subscriptions.push(command);
    };

    const envWatcher = vscode.workspace.createFileSystemWatcher('**/.env', true, false, true);
    envWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
    const appsettingsJsonWatcher = vscode.workspace.createFileSystemWatcher('**/appsettings.json', true, false, true);
    appsettingsJsonWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
    
    console.log('BotFramework Utility is now active!');
};

// this method is called when your extension is deactivated
export function deactivate(): void {}
