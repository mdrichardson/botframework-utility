import * as vscode from 'vscode';
import * as constants from '../../constants';
import { regexToVariables } from '..';
import { BotVariables } from '../../interfaces';
import { CommandOptions } from '../../interfaces/CommandOptions';

import fs = require('fs');
import { getWorkspaceRoot } from '../variables/getWorkspaceRoot';
import { getVsCodeConfig } from '../variables/getVsCodeConfig';
const fsP = fs.promises;

export async function executeTerminalCommand(
    command: string,
    options: CommandOptions = {
        commandTitle: 'Command',
        isTest: false,
    }): Promise<boolean|RegExpExecArray|Partial<BotVariables>> {

    const { commandCompleteRegex, commandFailedRegex, commandTitle, isTest, timeout, returnRegex } = options;

    // Force all commands to use single terminal type, for better control
    const userTerminalPath = (await getVsCodeConfig(constants.vsCodeConfigNames.customTerminalForAzCommands) as string);
    let terminalPath;
    if (!userTerminalPath) {
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
    } else {
        terminalPath = userTerminalPath;
    }

    // Join commands, as necessary
    for (const key in constants.terminal.pathRegex) {
        if (constants.terminal.pathRegex[key].test(terminalPath)) {
            command = command.replace(new RegExp(constants.terminal.join, 'gm'), constants.terminal.joins[key]);
            break;
        }
    }

    const terminal = await vscode.window.createTerminal(undefined, terminalPath);
    terminal.show(true);

    terminal.sendText(command, true);

    let result: boolean|RegExpExecArray|Partial<BotVariables> = false;

    let commandComplete = false;
    let matches = {};

    let terminalOutput;
    // Create a listener so we can tell if a command is successful
    (terminal as any).onDidWriteData(async (data): Promise<void> => {
        if (!commandComplete && data.trim()) {
            if (returnRegex && returnRegex.test(data)) {
                matches = (returnRegex.exec(data) as RegExpExecArray);
                terminal.dispose();
                commandComplete = true;
                result = Object.keys(matches).length > 0 && matches ? matches : true;
            } else {
                matches = await regexToVariables(data);
                /* istanbul ignore next: commands shouldn't fail during tests */
                if (commandFailedRegex && commandFailedRegex.test(data)) {
                    vscode.window.showErrorMessage(`${ commandTitle } failed.`);
                    // Stop listening as soon as we fail--Ensure we don't accidentally call a success message
                    commandComplete = true;
                    result = false;
                } else if (commandCompleteRegex && commandCompleteRegex.test(data)) {
                    vscode.window.showInformationMessage(`${ commandTitle } finished successfully. Terminal Closed`);
                    terminal.dispose();
                    commandComplete = true;
                    result = Object.keys(matches).length > 0 ? matches : true;
                }
                if (isTest) {
                    terminalOutput += data.toString('utf8');
                }
            }
        }
    });

    // If this is for testing (or we need regex returned), we want to force awaiting until command is complete
    if (isTest || returnRegex || timeout) {
        let totalTime = 0;
        while (!commandComplete && !result) {
            await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 500));
            totalTime += 500;
            if (timeout && totalTime >= timeout) {
                commandComplete = true;
                result = result ? result : false;
                if (isTest) {
                    const root = getWorkspaceRoot();
                    await fsP.writeFile(`${ root }\\${ constants.testing.TerminalOutput }`, terminalOutput);
                }
            }
        }
        if (isTest) {
            const root = getWorkspaceRoot();
            await fsP.writeFile(`${ root }\\${ constants.testing.TerminalOutput }`, terminalOutput);
        }
    }
    return result;
}