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
    async deploymentCreateResourceGroup(): Promise<void> {
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
        // Open terminal and execute AZ CLI Command
        settings = await utilities.getBotEnvVariables();
        executeAzCliCommand(`az group create --name ${settings.ResourceGroupName} --location ${settings.Location} --verbose`);
        vscode.window.showInformationMessage('Creating Resource Group');
    },
    async deploymentCreateWebApp(): Promise<void> {
        // Prep variables
        const botName = await vscode.window.showInputBox({ prompt: 'Enter a name for your bot' }) || '';
        let settings = await utilities.getBotEnvVariables();
        if (!settings.ResourceGroupName) {
            const rgName = await vscode.window.showInputBox({ prompt: 'Enter your Resource Group Name - Resource Group MUST EXIST!' }) || '';
            await utilities.setBotEnvVariables({ ResourceGroupName: rgName });
        }
        if (!settings.Location) {
            const location = await vscode.window.showInputBox({ prompt: 'Enter your Resource Group Location (ex: westus, westus2, eastus)' }) || '';
            await utilities.setBotEnvVariables({ Location: location });
        }
        if (!settings.CodeLangugage) {
            const language = await utilities.getLanguage();
            await utilities.setBotEnvVariables({ CodeLanguage: language });
        }
        // Open terminal and execute AZ CLI Command
        settings = await utilities.getBotEnvVariables();
        const command = `az bot create --kind webapp --name ${botName} --location ${settings.Location} --version v4 ` +
                        `--lang ${settings.CodeLanguage} --verbose --resource-group ${settings.ResourceGroupName}`
        executeAzCliCommand(command);
        vscode.window.showInformationMessage('Creating Web App');
    },
    async currentTest(): Promise<void> {
        await utilities.getLanguage();
    }
}

function executeAzCliCommand(command: string): void {
    const terminal = vscode.window.createTerminal();
    terminal.show();
    terminal.sendText(command);
}

export { commands };