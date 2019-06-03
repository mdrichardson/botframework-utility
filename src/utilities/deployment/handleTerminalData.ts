import * as constants from '../../constants';
import * as vscode from 'vscode';
import { BotVariables, CommandOptions } from "../../interfaces";
import { regexToVariables, getWorkspaceRoot } from "..";
import fs = require('fs');
const fsP = fs.promises;

export async function handleTerminalData(terminal: vscode.Terminal, options: CommandOptions): Promise<boolean|RegExpExecArray|Partial<BotVariables>> {
    const { commandCompleteRegex, commandFailedRegex, commandTitle, isTest, timeout, returnRegex } = options;

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
                result = matches;
            } else {
                matches = await regexToVariables(data);
                if (commandFailedRegex && commandFailedRegex.test(data)) {
                    vscode.window.showErrorMessage(`${ commandTitle } failed.`);
                    // Stop listening as soon as we fail--Ensure we don't accidentally call a success message
                    commandComplete = true;
                    result = false;
                } else if (commandCompleteRegex && commandCompleteRegex.test(data)) {
                    vscode.window.showInformationMessage(`${ commandTitle } finished successfully. Terminal Closed`);
                    terminal.dispose();
                    commandComplete = true;
                    result = matches;
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
                result = false;
            }
        }
        if (isTest) {
            const root = getWorkspaceRoot();
            await fsP.writeFile(`${ root }\\${ constants.testing.TerminalOutput }`, terminalOutput);
        }
    }
    return result;
}