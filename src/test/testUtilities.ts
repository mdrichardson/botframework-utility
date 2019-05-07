import * as constants from '../constants';
import * as vscode from 'vscode';
import { getWorkspaceRoot } from '../utilities';
import fs = require('fs');
const fsP = fs.promises;

export async function testTerminalCommand(
    command: string,
    commandCompleteRegex?: RegExp,
    commandFailedRegex?: RegExp,
    timeout?: number): Promise<boolean|object> {
    const terminalPath = 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe';
    const terminal = await vscode.window.createTerminal(undefined, terminalPath);

    // Write terminal output to text file to test
    const root = await getWorkspaceRoot();
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
    const root = await getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }\\${ constants.testing.TerminalOutput }`);
    } catch (err) {
        return;
    }
}

function deleteWebApp(name: string): void {
    const command = `az webapp delete --name ${ name }`;
    testTerminalCommand(command);
}

function deleteResourceGroup(name: string): void {
    const command = `az group delete -n ${ name } -y`;
    testTerminalCommand(command);
}

export function cleanup(webAppName: string, resourceGroupName: string): void {
    deleteWebApp(webAppName);
    deleteResourceGroup(resourceGroupName);
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
    const root = await getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }\\web.config`);
    } catch (err) { }
    try {
        await fsP.unlink(`${ root }\\.deployment`);
    } catch (err) { }
}

export async function deleteEnvFiles(): Promise<void> {
    const root = await getWorkspaceRoot();
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
            await fsP.unlink(file.fsPath);
        });
    });
}