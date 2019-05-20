import * as vscode from 'vscode';

export function getWorkspaceRoot(): string {
    return (vscode.workspace.workspaceFolders as vscode.WorkspaceFolder[])[0].uri.fsPath;
}