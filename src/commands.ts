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
    async deploymentResourceGroup(): Promise<void> {
        // Prep variables
        let settings = await utilities.getBotEnvVariables();
        if (!settings.ResourceGroupName) {
            const rgName = await vscode.window.showInputBox({ prompt: 'Enter your Resource Group Name' }) || '';
            await utilities.setBotEnvVariables({ ResourceGroupName: rgName });
        }
        if (!settings.Location) {
            const location = await vscode.window.showInputBox({ prompt: 'Enter your Resource Group Location (ex: westus, westus2, eastus)' }) || '';
            await utilities.setBotEnvVariables({ Location: location });
        }
        settings = await utilities.getBotEnvVariables();
        const terminal = vscode.window.createTerminal();
        terminal.show();
        terminal.sendText(`az group create --name ${settings.ResourceGroupName} --location ${settings.Location} --verbose`);
        vscode.window.showInformationMessage('Creating Resource Group');
        terminal.dispose();
    },
    async currentTest(): Promise<void> {
        await utilities.getBotEnvVariables();
    }
}

export { commands };