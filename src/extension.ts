import * as vscode from 'vscode';
import { log } from 'console';
import { loadCommands, watchEnvFiles, syncLocalBotVariablesToEnv } from './utilities';

/* istanbul ignore next: for whatever reason, this is impossible to call during tests */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    await syncLocalBotVariablesToEnv();

    loadCommands(context);    

    watchEnvFiles();
    
    log('BotFramework Utility is now active!');
}

export function deactivate(): void {}
