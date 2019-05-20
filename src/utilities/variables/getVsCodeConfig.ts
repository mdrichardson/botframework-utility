import * as vscode from 'vscode';

// Use undefined to clear
export async function getVsCodeConfig(configName: string): Promise<string> {
    return await (await vscode.workspace.getConfiguration().get(`botframework-utility.${ configName }`) as string) || '';
}