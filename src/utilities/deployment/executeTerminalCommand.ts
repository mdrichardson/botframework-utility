import * as vscode from 'vscode';
import { regexToEnvVariables } from '..';

export default async function executeTerminalCommand(
    command: string,
    commandCompleteRegex?: RegExp,
    commandTitle: string = 'Command',
    commandFailedRegex?: RegExp): Promise<void> {
    // Force all commands to use single terminal type, for better control
    const userTerminalPath = (vscode.workspace.getConfiguration('botframework-utility').get('customTerminalForAzCommandsPath') as string);
    let terminalPath = userTerminalPath ? userTerminalPath : undefined;
    if (command.toLowerCase().startsWith('az') && !userTerminalPath) {
        switch (process.platform) {
            case 'win32':
                terminalPath = 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe';
                break;
            case 'darwin':
                terminalPath = '/bin/bash';
                break;
            default:
                terminalPath = 'sh';
        }
    }
    const terminal = await vscode.window.createTerminal(undefined, terminalPath);
    let listenForData = true;
    (terminal as any).onDidWriteData(async (data): Promise<void> => {
        if (listenForData) {
            await regexToEnvVariables(data);
            if (data.trim() && commandFailedRegex && commandFailedRegex.test(data)) {
                vscode.window.showErrorMessage(`${ commandTitle } failed.`);
                // Ensure we don't call a success message
                listenForData = false;
            } else if (data.trim() && commandCompleteRegex && commandCompleteRegex.test(data)) {
                vscode.window.showInformationMessage(`${ commandTitle } finished successfully. Terminal Closed`);
                terminal.dispose();
            }
        }
    });
    terminal.show(true);
    terminal.sendText(command, true);
}