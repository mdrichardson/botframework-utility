import * as constants from '../src/constants';
import * as vscode from 'vscode';
import fs = require('fs');
import { getWorkspaceRoot } from '../src/utilities';
const fsP = fs.promises;

export async function testTerminalCommand(
    command: string,
    commandCompleteRegex?: RegExp,
    commandFailedRegex?: RegExp,
    timeout?: number): Promise<boolean|object> {
    const terminalPath = 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe';
    const terminal = await vscode.window.createTerminal(undefined, terminalPath);

    // Write terminal output to text file to test
    const root = getWorkspaceRoot();
    command = `&{ ${ command } } | Tee-Object -FilePath "${ root }\\${ constants.testing.TerminalOutput }"`;
                
    terminal.show(true);
    terminal.sendText(command, true);

    if (commandCompleteRegex || commandFailedRegex) {
        let commandComplete = false;
        const consoleOutputWatcher = vscode.workspace.createFileSystemWatcher(`**/${ constants.testing.TerminalOutput }`, true, false, true);
        consoleOutputWatcher.onDidChange(async (): Promise<void> => {
            commandComplete = true;
        });
    
        let totalTime = 0;
        while (!commandComplete) {
            await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
            totalTime += 1000;
            if (timeout && totalTime >= timeout) {
                commandComplete = true;
            }
        }
    
        let res;
        try {
            res = (await fsP.readFile(`${ root }\\${ constants.testing.TerminalOutput }`, { encoding: 'utf16le', flag: 'r' })).toString();
        } catch (err) {
            res = '';
        }
        const regexPatterns = [
            constants.regexForVariables.MicrosoftAppId,
            constants.regexForVariables.MicrosoftAppPassword
        ];
    
        let matches = {};
        
        await regexPatterns.forEach(async (r): Promise<void> => {
            const match = r.exec(res) || { groups: null };
            if (match.groups) {
                matches = {...matches, ...match.groups};
            }
        });
        if (commandCompleteRegex && res.match(commandCompleteRegex)) {
            return matches ? matches : true;
        } else if (commandFailedRegex && !res.match(commandFailedRegex)) {
            return matches ? matches : true;
        }
        return false;
    }
    return true;    
}

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
    testTerminalCommand(command);
}

function deleteResourceGroup(name: string): void {
    const command = `az group delete -n ${ name } -y`;
    testTerminalCommand(command);
}

export async function cleanup(appId: string, resourceGroupName: string): Promise<void> {
    await deleteAppRegistration(appId);
    await deleteResourceGroup(resourceGroupName);
}

export async function deleteResourceGroupDeployment(name: string): Promise<void> {
    const command = `az group deployment delete -n ${ name }`;
    testTerminalCommand(command);
    await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
}

export async function deleteBot(name: string): Promise<void> {
    const command = `az bot delete --name ${ name }`;
    testTerminalCommand(command);
    await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 3000));
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