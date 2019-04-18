import * as vscode from 'vscode';
import * as utilities from './utilities';
import * as constants from './constants';

const zip = require('zip-a-folder');

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
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);
        await utilities.getIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location);
        // Open terminal and execute AZ CLI Command
        const settings = await utilities.getBotEnvVariables();
        executeAzCliCommand(`az group create --name ${settings.ResourceGroupName} --location ${settings.Location} --verbose`);
        vscode.window.showInformationMessage('Creating Resource Group');
    },
    async deploymentCreateWebApp(): Promise<void> {
        // Prep variables
        await utilities.getIfNotExist(constants.envVars.BotName, constants.envVarPrompts.);
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);
        await utilities.getIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location);
        await utilities.getIfNotExist(constants.envVars.CodeLanguage, constants.envVarPrompts.CodeLanguage);

        // Open terminal and execute AZ CLI Command
        const settings = await utilities.getBotEnvVariables();
        const command = `az bot create --kind webapp --name ${settings.BotName} --location ${settings.Location} --version v4 ` +
                        `--lang ${settings.CodeLanguage} --verbose --resource-group ${settings.ResourceGroupName}`
        executeAzCliCommand(command);
        vscode.window.showInformationMessage('Creating Web App');
    },
    async deploymentPublish(): Promise<void> {
        vscode.window.showInformationMessage('Creating Zip File');
        const root = utilities.getRoot();
        await zip.zip(root, `${root}/update.zip`);
        vscode.window.showInformationMessage('Done Creating Zip File');

        await utilities.getIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);

        const settings = await utilities.getBotEnvVariables();

        if (settings.CodeLanguage === 'Csharp') {
            const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
            const csprojFile = csproj[0].fsPath;
            executeAzCliCommand(`az webapp config appsettings set --resource-group ${settings.ResourceGroupName} --name ${settings.BotName} --settings SCM_DO_BUILD_DEPLOYMENT=false`);
            executeAzCliCommand(`az webapp config appsettings set --resource-group ${settings.ResourceGroupName} --name ${settings.BotName} --settings SCM_SCRIPT_GENERATOR_ARGS="--aspNetCore ${csprojFile}"`);
            executeAzCliCommand(`az webapp deployment source config-zip --resource-group ${settings.ResourceGroupName} --name ${settings.BotName} --src "update.zip"`);
        }
        // TODO: Test C# Publish.Make it work for Node. Add the actual publish commands. Delete zip file.
    },
    async currentTest(): Promise<void> {
        const terminal = vscode.window.createTerminal();
        (<any>terminal).onDidWriteData(data => {
            console.log(`DATA: ${data}`);
        })
        terminal.show(true);
        terminal.sendText(`az --help`)
    }
}

function executeAzCliCommand(command: string, commandCompleteRegex?: RegExp, commandCompleteTitle: string = 'Command'): void {
    const terminal = vscode.window.createTerminal();
    (<any>terminal).onDidWriteData(data => {
        console.log(`DATA: ${data}`);
        if (commandCompleteRegex) {
            vscode.window.showInformationMessage(`${commandCompleteTitle} finished.`);
        }
    });
    terminal.show(true);
    terminal.sendText(command);
}

export { commands };