import * as constants from '../src/constants';
import * as vscode from 'vscode';
import fs = require('fs');
import { getWorkspaceRoot, executeTerminalCommand } from '../src/utilities';
const fsP = fs.promises;

export async function deleteTerminalOutputFile(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }\\${ constants.testing.TerminalOutput }`);
    } catch (err) {
        return;
    }
}

function deleteAppRegistration(id: string): void {
    const command = `az ad app delete --id ${ id }`;
    executeTerminalCommand(command, { isTest: true, timeout: 5000 });
}

function deleteResourceGroup(name: string): void {
    const command = `az group delete -n ${ name } -y`;
    executeTerminalCommand(command, { isTest: true, timeout: 15000 });
}

export async function cleanup(appId: string, resourceGroupName: string): Promise<void> {
    await deleteAppRegistration(appId);
    await deleteResourceGroup(resourceGroupName);
}

export async function deleteResourceGroupDeployment(name: string): Promise<void> {
    const command = `az group deployment delete -n ${ name }`;
    executeTerminalCommand(command, { isTest: true, timeout: 15000 });
}

export async function deleteBot(name: string): Promise<void> {
    const command = `az bot delete --name ${ name }`;
    executeTerminalCommand(command, { isTest: true, timeout: 5000 });
}

export async function deletePrepareDeployFiles(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }\\web.config`);
    } catch (err) { }
    try {
        await fsP.unlink(`${ root }\\.deployment`);
    } catch (err) { }
}

export async function deleteEnvFiles(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }\\.env`);
    } catch (err) { }
    try {
        await fsP.unlink(`${ root }\\appsettings.json`);
    } catch (err) { }
}

export async function writeCodeFiles(lang: string): Promise<void> {
    const root = getWorkspaceRoot();
    const data = { test: 'test' };
    switch(lang) {
        case constants.sdkLanguages.Csharp:
            fsP.writeFile(`${ root }\\${ constants.settingsFiles.Csharp }`, data);
            break;
        default:
            fsP.writeFile(`${ root }\\${ constants.settingsFiles.Node }`, data);   
    }
}

export async function deleteCodeFiles(): Promise<void> {
    const csFiles = await vscode.workspace.findFiles('**/*.cs');
    const jsFiles = await vscode.workspace.findFiles('**/*.js');
    const tsFiles = await vscode.workspace.findFiles('**/*.ts');
    const files = [
        csFiles,
        jsFiles,
        tsFiles
    ];
    await files.forEach(async (codeFiles): Promise<void> => {
        await codeFiles.forEach(async (file): Promise<void> => {
            try {
                await fsP.unlink(file.fsPath);
            } catch (err) { }
        });
    });
}

export async function deleteDownloadTemplates(): Promise<void> {
    const files = await vscode.workspace.findFiles('deploymentTemplates/*.json');
    for (const index in files) {
        try {
            await fsP.unlink(files[index].fsPath);
        } catch (err) { }
    }
}

export function testNotify(text: string): void {
    console.warn(`### ${ text }\r`);
}