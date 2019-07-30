import * as vscode from 'vscode';

// Use undefined to clear
export async function getVsCodeConfig(configName: string): Promise<string|string[]> {
    return await (await vscode.workspace.getConfiguration('botframework-utility').get(`${ configName }`) as string) || '';
}