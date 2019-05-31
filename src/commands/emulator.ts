import * as vscode from 'vscode';
import * as constants from '../constants';

import { Commands } from '../interfaces';
import { getEmulatorLaunchCommand, executeTerminalCommand, promptForVariableIfNotExist, log, getSingleEndpoint, promptForNewEndpoint } from '../utilities';

const emulatorCommands: Commands = {
    async createEndpoint(): Promise<void> {
        await promptForNewEndpoint();
    },
    async openEmulatorLocalhost(): Promise<void> {
        vscode.window.showInformationMessage('Opening Emulator at localhost');
        var command = getEmulatorLaunchCommand('http://localhost:3978/api/messages');
        // Note: We have to open the bfemulator:// links through a terminal. vscode.env.openExternal decodes the / in URL, which doesn't work with emulator
        // Waiting on this issue to be fixed so we can auto-close the terminal: https://github.com/Microsoft/BotFramework-Emulator/issues/1136
        await executeTerminalCommand(command);
        // await executeTerminalCommand(command, constants.regex.forDispose.Emulator, 'Emulator Launch');
    },
    async openEmulatorLocalhostWithApp(): Promise<void> {
        const appId = await promptForVariableIfNotExist(constants.variables.botVariables.MicrosoftAppId);
        const appPassword = await promptForVariableIfNotExist(constants.variables.botVariables.MicrosoftAppPassword);
        
        vscode.window.showInformationMessage('Opening Emulator at localhost');
        const command = getEmulatorLaunchCommand('http://localhost:3978/api/messages', { appId, appPassword });
        await executeTerminalCommand(command);
    },
    async openEmulatorProduction(): Promise<void> {
        const endpoint = await getSingleEndpoint();
        
        if (endpoint) {
            vscode.window.showInformationMessage(`Opening Emulator at ${ endpoint.Name }: ${ endpoint.Host }`);
            const command = getEmulatorLaunchCommand(endpoint.Host, { 
                appId: endpoint.AppId, 
                appPassword: endpoint.AppPassword,
            });
            await executeTerminalCommand(command);
        } else { log('No Endpoint Found'); }
    }
};

export { emulatorCommands };