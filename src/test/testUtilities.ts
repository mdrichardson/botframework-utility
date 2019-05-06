import * as constants from '../constants';
import * as vscode from 'vscode';
import { BotVariables } from '../interfaces';
import { getWorkspaceRoot } from '../utilities';
import fs = require('fs');
const fsP = fs.promises;

export async function newEnvFile(language: string = constants.sdkLanguages.Csharp, variables: Partial<BotVariables>): Promise<void> {
    const root = await getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }\\${ constants.settingsFiles[language] }`);
    } catch (err) {
        console.log(err);
    }
    await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
    const envString = JSON.stringify(variables, null, 2);
    if (language == constants.sdkLanguages.Csharp) {
        await fsP.writeFile(`${ root }\\${ constants.settingsFiles.Csharp }`, envString);
    } else {
        let envString = '';
        for (const key in variables) {
            // put in .env format: Key="value"
            envString += `${ key }=\"${ variables[key] }\"\n`;
        }
        await fsP.writeFile(`${ root }\\${ constants.settingsFiles.Node }`, envString);
    }
}

export async function testTerminalCommand(
    command: string,
    commandCompleteRegex?: RegExp,
    commandFailedRegex?: RegExp): Promise<boolean|object> {
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
    
        while (!commandComplete) {
            await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
        }
    
        const res = (await fsP.readFile(`${ root }\\${ constants.testing.TerminalOutput }`, { encoding: 'utf16le', flag: 'r' })).toString();
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

export function deleteResourceGroup(name: string): void {
    const command = `az group delete -n ${ name }`;
    testTerminalCommand(command);
}