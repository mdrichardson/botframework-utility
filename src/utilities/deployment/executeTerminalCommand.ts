import * as vscode from 'vscode';
import * as constants from '../../constants';
import { regexToVariables } from '..';
import { BotVariables } from '../../interfaces';
import { CommandOptions } from '../../interfaces/CommandOptions';

import fs = require('fs');
import { getWorkspaceRoot } from '../variables/getWorkspaceRoot';
const fsP = fs.promises;

export async function executeTerminalCommand(
    command: string,
    options: CommandOptions = {
        commandTitle: 'Command',
        isTest: false,
    }): Promise<boolean|Partial<BotVariables>> {

    const { commandCompleteRegex, commandFailedRegex, commandTitle, isTest, timeout } = options;

    // Force all commands to use single terminal type, for better control
    const userTerminalPath = (await vscode.workspace.getConfiguration().get('botframework-utility.customTerminalForAzCommands') as string);
    let terminalPath = userTerminalPath ? userTerminalPath : undefined;
    if (command.toLowerCase().startsWith('az') && !userTerminalPath) {
        switch (process.platform) {
            case 'win32':
                terminalPath = 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe';
                break;
            /* istanbul ignore next: not testing linux */
            case 'darwin':
                terminalPath = '/bin/bash';
                break;
            /* istanbul ignore next: not testing MacOS */
            default:
                terminalPath = 'sh';
        }
    }

    const terminal = await vscode.window.createTerminal(undefined, terminalPath);
    terminal.show(true);

    terminal.sendText(command, true);

    let result: boolean|Partial<BotVariables> = true;

    let commandComplete = false;
    let matches = {};

    let terminalOutput;
    // Create a listener so we can tell if a command is successful
    (terminal as any).onDidWriteData(async (data): Promise<void> => {
        if (!commandComplete) {
            matches = await regexToVariables(data);
            /* istanbul ignore next: commands shouldn't fail during tests */
            if (data.trim() && commandFailedRegex && commandFailedRegex.test(data)) {
                vscode.window.showErrorMessage(`${ commandTitle } failed.`);
                // Stop listening as soon as we fail--Ensure we don't accidentally call a success message
                commandComplete = true;
                result = false;
            } else if (data.trim() && commandCompleteRegex && commandCompleteRegex.test(data)) {
                vscode.window.showInformationMessage(`${ commandTitle } finished successfully. Terminal Closed`);
                terminal.dispose();
                commandComplete = true;
                result = Object.keys(matches).length > 0 ? matches : true;
            }
            if (isTest) {
                terminalOutput += data.toString('utf8');
            }
        }
    });

    // If this is for testing, we want to force awaiting until command is complete
    if (isTest) {
        let totalTime = 0;
        while (!commandComplete) {
            await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 500));
            totalTime += 500;
            if (timeout && totalTime >= timeout) {
                commandComplete = true;
                const root = getWorkspaceRoot();
                await fsP.writeFile(`${ root }\\${ constants.testing.TerminalOutput }`, terminalOutput);
            }
        }
        const root = getWorkspaceRoot();
        await fsP.writeFile(`${ root }\\${ constants.testing.TerminalOutput }`, terminalOutput);
    }
    return result;
}