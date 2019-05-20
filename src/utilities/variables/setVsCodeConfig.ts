import * as vscode from 'vscode';

// Use undefined to clear
export async function setVsCodeConfig(configName: string, setting: any): Promise<void> {
    await vscode.workspace.getConfiguration().update(`botframework-utility.${ configName }`, setting, vscode.ConfigurationTarget.Global);
}