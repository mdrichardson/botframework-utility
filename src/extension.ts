import * as vscode from 'vscode';
import { log } from 'console';
import { loadCommands, watchEnvFiles, syncLocalBotVariablesToEnv } from './utilities';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    await syncLocalBotVariablesToEnv();

    loadCommands(context);    

    watchEnvFiles();
    
    log('BotFramework Utility is now active!');
}

export function deactivate(): void {}
