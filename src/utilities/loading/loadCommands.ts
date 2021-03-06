import * as vscode from 'vscode';
import { deploymentCommands, emulatorCommands, toolsCommands, samplesCommands } from '../../commands';

export function loadCommands(context: vscode.ExtensionContext): void {
    const allCommands = [
        deploymentCommands,
        emulatorCommands,
        samplesCommands,
        toolsCommands
    ];
    allCommands.forEach((commandSet): void => {
        for (const key in commandSet) {
            const command = vscode.commands.registerCommand(`botframework-utility.${ key }`, commandSet[key]);
            context.subscriptions.push(command);
        }
    });
}