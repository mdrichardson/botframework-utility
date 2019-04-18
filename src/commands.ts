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
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupNameBeingCreated);
        await utilities.getIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location);
        // Open terminal and execute AZ CLI Command
        const settings = await utilities.getBotEnvVariables();
        const command = `az group create --name "${settings.ResourceGroupName}" --location "${settings.Location}" --verbose`;
        executeAzCliCommand(command, /"provisioningState": "Succeeded"/g, 'Resource Group Creation');
        vscode.window.showInformationMessage('Creating Resource Group');
    },
    async deploymentCreateWebApp(): Promise<void> {
        // Prep variables
        await utilities.getIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);
        await utilities.getIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location);
        await utilities.getIfNotExist(constants.envVars.CodeLanguage, constants.envVarPrompts.CodeLanguage);

        // Open terminal and execute AZ CLI Command
        const settings = await utilities.getBotEnvVariables();
        const command = `az bot create --kind webapp --name "${settings.BotName}" --location "${settings.Location}" --version v4 ` +
                        `--lang "${settings.CodeLanguage}" --verbose --resource-group "${settings.ResourceGroupName}"`
        executeAzCliCommand(command, /"appId":[\s\S]*"appPassword":/g, 'Web App Creation');
        vscode.window.showInformationMessage('Creating Web App');
    },
    async deploymentPublish(): Promise<void> {

        await utilities.getIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);
        await utilities.getIfNotExist(constants.envVars.CodeLanguage, constants.envVarPrompts.CodeLanguage);

        vscode.window.showInformationMessage('Creating Zip File');
        const root = utilities.getRoot();
        await zip.zip(root, `${root}/update.zip`);
        vscode.window.showInformationMessage('Done Creating Zip File');

        const settings = await utilities.getBotEnvVariables();

        if (settings.CodeLanguage === constants.sdkLanguages.Csharp) {
            const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
            const csprojFile = csproj[0].fsPath.split('\\').pop();
            const scmCommand = `az webapp config appsettings set --resource-group "${settings.ResourceGroupName}" --name "${settings.BotName}" --settings SCM_DO_BUILD_DEPLOYMENT=false`;
            const generatorCommand = `az webapp config appsettings set --resource-group "${settings.ResourceGroupName}" --name "${settings.BotName}" --settings SCM_SCRIPT_GENERATOR_ARGS="--aspNetCore ${csprojFile}"`;
            const publishCommand = `az webapp deployment source config-zip --resource-group "${settings.ResourceGroupName}" --name "${settings.BotName}" --src "update.zip"`;
            executeAzCliCommand(scmCommand, /"name":.*"SCM_DO_BUILD_DEPLOYMENT",[\s\S]*"slotSetting":.*false,/g, 'SET SCM_DO_BUILD_DEPLOYMENT');
            executeAzCliCommand(generatorCommand, /"name":.*"SCM_SCRIPT_GENERATOR_ARGS",[\s\S]*"slotSetting":.*false,[\s\S]*"value":.*"--aspNetCore/g, 'SET SCM_SCRIPT_GENERATOR');
            executeAzCliCommand(publishCommand, /"complete": true,[\s\S]*"deployer": "Push-Deployer",[\s\S]*"progress": ""/g, 'Zip Deployment');
        }
        // TODO: Make it work for Node. Add the actual publish commands. Delete zip file.
    },
    async currentTest(): Promise<void> {
        const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
            const csprojFile = csproj[0].fsPath.split('\\').pop();
        const settings = {
            MicrosoftAppId: "d23d9a36-1c1c-4fe9-9ad7-9f8eb7664ce0",
            ResourceGroupName: "vmicricTEST",
            BotName: "vmicricTEST"
        }
        // TODO: FIX GENERATOR ARGS
        const generatorCommand = `az webapp config appsettings set --resource-group "${settings.ResourceGroupName}" --name "${settings.BotName}" --settings SCM_SCRIPT_GENERATOR_ARGS="--aspNetCore ${csprojFile}"`
        executeAzCliCommand(generatorCommand);
    }
}

function executeAzCliCommand(command: string, commandCompleteRegex?: RegExp, commandCompleteTitle: string = 'Command'): void {
    const terminal = vscode.window.createTerminal();
    (<any>terminal).onDidWriteData(data => {
        console.log(`DATA: ${data}`);
        if (commandCompleteRegex && commandCompleteRegex.test(data)) {
            vscode.window.showInformationMessage(`${commandCompleteTitle} finished successfully. Terminal Closed`);
            terminal.dispose();
        }
    });
    terminal.show(true);
    terminal.sendText(command);
}

export { commands };