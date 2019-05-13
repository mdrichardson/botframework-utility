import * as vscode from 'vscode';

export function getWorkspaceRoot(): string {
    return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : __dirname;
}