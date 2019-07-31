import * as vscode from 'vscode';
import { getTerminalPath, handleTerminalData } from '..';
import { CommandOptions, BotVariables } from '../../interfaces';
import { joinTerminalCommands } from './joinTerminalCommands';


export async function executeTerminalCommand(
    command: string|string[],
    commandOptions: CommandOptions = {
        commandTitle: 'Command',
        isTest: false,
    },
    terminalOptions: vscode.TerminalOptions = {}): Promise<boolean|RegExpExecArray|Partial<BotVariables>> {
    
    terminalOptions.shellPath = terminalOptions.shellPath ? terminalOptions.shellPath : await getTerminalPath();

    if (Array.isArray(command)) {
        command = joinTerminalCommands(command, terminalOptions.shellPath);
    }

    const terminal = await vscode.window.createTerminal(terminalOptions);
    // terminal.show(true);

    terminal.sendText(command, true);

    return await handleTerminalData(terminal, commandOptions);
}