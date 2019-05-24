import * as vscode from 'vscode';
import { getTerminalPath, handleTerminalData } from '..';
import { CommandOptions, BotVariables } from '../../interfaces';
import { joinTerminalCommands } from './joinTerminalCommands';


export async function executeTerminalCommand(
    command: string|string[],
    options: CommandOptions = {
        commandTitle: 'Command',
        isTest: false,
    }): Promise<boolean|RegExpExecArray|Partial<BotVariables>> {
    
    const terminalPath = await getTerminalPath();

    if (Array.isArray(command)) {
        command = joinTerminalCommands(command, terminalPath);
    }

    const terminal = await vscode.window.createTerminal(undefined, terminalPath);
    terminal.show(true);

    terminal.sendText(command, true);

    return await handleTerminalData(terminal, options);
}