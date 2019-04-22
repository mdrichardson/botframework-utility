import * as vscode from 'vscode';

import { Commands } from '../interfaces';
import { createEmulatorUri } from '../utilities';

const emulatorCommands: Commands = {
    openEmulatorLocalhost(): void {
        vscode.window.showInformationMessage('Opening Emulator at localhost');
        var uri = createEmulatorUri(`http://localhost:3978/api/messages`);
        vscode.env.openExternal(uri);
    }
};

export { emulatorCommands };