import * as vscode from 'vscode';
import { syncLocalBotVariablesToEnv } from '..';

export function watchEnvFiles(): void {
    // Watch .env and appsettings.json for changes
    const envWatcher = vscode.workspace.createFileSystemWatcher('**/.env', true, false, true);
    envWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
    const appsettingsJsonWatcher = vscode.workspace.createFileSystemWatcher('**/appsettings.json', true, false, true);
    appsettingsJsonWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
}