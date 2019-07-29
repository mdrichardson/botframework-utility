import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { getWorkspaceRoot, executeTerminalCommand } from '../src/utilities';
import fs = require('fs');
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
    const command = `az group delete -n "${ name }" -y`;
    executeTerminalCommand(command, { isTest: true, timeout: 15000 });
}

export async function cleanup(appId: string, resourceGroupName: string): Promise<void> {
    await deleteAppRegistration(appId);
    await deleteResourceGroup(resourceGroupName);
}

export async function deleteResourceGroupDeployment(name: string): Promise<void> {
    const command = `az group deployment delete -n "${ name }"`;
    executeTerminalCommand(command, { isTest: true, timeout: 15000 });
}

export async function deleteBot(name: string, resourceGroup: string): Promise<void> {
    const command = `az bot delete --name "${ name }" --resource-group "${ resourceGroup }"`;
    executeTerminalCommand(command, { isTest: true, timeout: 5000 });
}

export async function deletePrepareDeployFiles(): Promise<void> {
    const root = getWorkspaceRoot();
    const files = [
        `${ root }\\web.config`,
        `${ root }\\.deployment`
    ];
    await Promise.all(files.map(async (file): Promise<void> => {
        if (fs.existsSync(file)) {
            await fsP.unlink(file);
        }
    }));
}

export async function clearEnvVariables(): Promise<void> {
    const root = getWorkspaceRoot();
    const files = [
        `${ root }\\.env`,
        `${ root }\\appsettings.json`
    ];
    await Promise.all(files.map(async (file): Promise<void> => {
        try {
            if (fs.existsSync(file)) {
                await fsP.unlink(file);
            }
        } catch (err) { }
    }));
    process.env['BOTFRAMEWORK_UTILITY'] = '';
}

export async function writeCodeFiles(lang?: string): Promise<void> {
    const root = getWorkspaceRoot();
    const data = JSON.stringify({ test: 'test' }, null, 2);
    switch(lang) {
        case constants.variables.sdkLanguages.Csharp:
            await fsP.writeFile(`${ root }\\test.cs`, data);
            break;
        case constants.variables.sdkLanguages.Typescript:
            try {
                await fsP.mkdir(`${ root }\\src`);
            } catch (err) { }
            await fsP.writeFile(`${ root }\\src\\test.ts`, data);
            break;
        case constants.variables.sdkLanguages.Node:
            await fsP.writeFile(`${ root }\\test.js`, data);
            break;
        default:
            await fsP.writeFile(`${ root }\\test.cs`, data);
            try {
                await fsP.mkdir(`${ root }\\src`);
            } catch (err) { }
            await fsP.writeFile(`${ root }\\src\\test.ts`, data);
            await fsP.writeFile(`${ root }\\test.js`, data); 
    }
    // Ensure files won't be locked
    await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
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

export async function makeNestedTestDir(): Promise<string> {
    const root = getWorkspaceRoot();

    const testDir = `${ root }\\TestDir`;
    await fsP.mkdir(testDir);
    await fsP.writeFile(`${ testDir }\\testFile.txt`, 'test');

    const nestedDir = `${ testDir }\\nestedDir`;
    await fsP.mkdir(nestedDir);
    await fsP.writeFile(`${ nestedDir }\\nestedFile.txt`, 'test');

    return testDir;
}

export async function disposeAllTerminals(): Promise<void> {
    const terminals = vscode.window.terminals;
    await Promise.all(terminals.map(async (terminal): Promise<void> => {
        await terminal.dispose();
    }));
}