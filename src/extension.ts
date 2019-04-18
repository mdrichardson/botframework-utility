// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands } from './commands';
import * as utilities from './utilities';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    console.log('BotFramework Utility is now active!');

    // Load appsettings.json/.env into env variables
    await utilities.loadBotSettings();

	// Load commands from commands.ts
    for (const key in commands) {
        const command = vscode.commands.registerCommand(`extension.${key}`, commands[key]);
        context.subscriptions.push(command);
    }}

// this method is called when your extension is deactivated
export function deactivate() {}
