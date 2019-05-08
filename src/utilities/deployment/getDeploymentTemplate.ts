import * as vscode from 'vscode';
import { downloadTemplate } from '..';

export default async function getDeploymentTemplate(templateName: string): Promise<string> {
    const existingTemplate = (await vscode.workspace.findFiles(`**/${ templateName }`, null, 1))[0];
    if (!existingTemplate) {
        await downloadTemplate(templateName);
    }
    return (await vscode.workspace.findFiles(`**/${ templateName }`, null, 1))[0].fsPath;
}