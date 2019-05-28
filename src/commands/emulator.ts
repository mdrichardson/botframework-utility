import * as vscode from 'vscode';

import { Commands } from '../interfaces';
import { getEmulatorLaunchCommand, executeTerminalCommand } from '../utilities';

const emulatorCommands: Commands = {
    async openEmulatorLocalhost(): Promise<void> {
        vscode.window.showInformationMessage('Opening Emulator at localhost');
        var command = getEmulatorLaunchCommand('http://localhost:3978/api/messages');
        // Note: We have to open the bfemulator:// links through a terminal. vscode.env.openExternal decodes the / in URL, which doesn't work with emulator
        // Waiting on this issue to be fixed so we can auto-close the terminal: https://github.com/Microsoft/BotFramework-Emulator/issues/1136
        await executeTerminalCommand(command);
        // await executeTerminalCommand(command, constants.regex.forDispose.Emulator, 'Emulator Launch');
    }
};

export { emulatorCommands };