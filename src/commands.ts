import * as vscode from 'vscode';
import * as utilities from './utilities';

export type ICommands = {
    [index: string]: () => void | Promise<void>;
}

const commands: ICommands = {
    openEmulatorLocalhost(): void {
        vscode.window.showInformationMessage('Opening Emulator at localhost');
        var uri = utilities.createEmulatorUri(`http://localhost:3978/api/messages`);
        vscode.env.openExternal(uri);
    },
    async currentTest(): Promise<void> {
        utilities.getBotSettings();
    }
}

export { commands };