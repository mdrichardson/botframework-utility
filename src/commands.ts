import * as vscode from 'vscode';
import * as utilities from './utilities';
import * as constants from './constants';

import zip = require('zip-a-folder');

export interface Commands {
    [index: string]: () => void | Promise<void>;
}

const commands: Commands = {
    openEmulatorLocalhost(): void {
        vscode.window.showInformationMessage('Opening Emulator at localhost');
        var uri = utilities.createEmulatorUri(`http://localhost:3978/api/messages`);
        vscode.env.openExternal(uri);
    },
    async createAppRegistration(): Promise<void> {

        let settings = await utilities.getEnvBotVariables();

        if (settings.MicrosoftAppId && settings.MicrosoftAppPassword) {
            // Allow user to delete appId and pass from .env/appsettings.json
            settings = await utilities.getAndSyncLocalAndEnvVariables();
            if (settings.MicrosoftAppId && settings.MicrosoftAppPassword) {
                vscode.window.showInformationMessage(`You already have an App Registration.`);
                return;
            }
        }

        // Prep Variables
        await utilities.getIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.getIfNotExist(constants.envVars.MicrosoftAppPassword, constants.envVarPrompts.MicrosoftAppPasswordBeingCreated);

        settings = await utilities.getEnvBotVariables();

        const command = `az ad app create --display-name "${ settings.BotName }" --password "${ settings.MicrosoftAppPassword }" --available-to-other-tenants`;
        const regex = constants.regexForDispose.WebappCreate;

        vscode.window.showInformationMessage('Creating App Registration');
        await executeAzCliCommand(command, regex, 'App Registration Creation');
    },
    async deploymentCreateResourcesNewResourceGroup(): Promise<void> {

    },
    async deploymentCreateResourceGroup(): Promise<void> {
        // Prep variables
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupNameBeingCreated);
        await utilities.getIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location);
        // Open terminal and execute AZ CLI Command
        const settings = await utilities.getEnvBotVariables();
        const command = `az group create --name "${ settings.ResourceGroupName }" --location "${ settings.Location }" --verbose`;
        await executeAzCliCommand(command, /"provisioningState": "Succeeded"/g, 'Resource Group Creation');
        vscode.window.showInformationMessage('Creating Resource Group');
    },
    async deploymentCreateWebApp(): Promise<void> {
        // Prep variables
        await utilities.getIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);
        await utilities.getIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location);
        await utilities.getIfNotExist(constants.envVars.CodeLanguage, constants.envVarPrompts.CodeLanguage);

        // Open terminal and execute AZ CLI Command
        const settings = await utilities.getEnvBotVariables();
        const command = `az bot create --kind webapp --name "${ settings.BotName }" --location "${ settings.Location }" --version v4 ` +
                        `--lang "${ settings.CodeLanguage }" --verbose --resource-group "${ settings.ResourceGroupName }"`;
        await executeAzCliCommand(command, /"appId":[\s\S]*"appPassword":/g, 'Web App Creation');
        vscode.window.showInformationMessage('Creating Web App');
    },
    async deploymentPublish(): Promise<void> {

        await utilities.getIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.getIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);
        await utilities.getIfNotExist(constants.envVars.CodeLanguage, constants.envVarPrompts.CodeLanguage);

        vscode.window.showInformationMessage('Creating Zip File');
        const root = utilities.getWorkspaceRoot();
        await zip.zip(root, `${ root }/update.zip`);
        vscode.window.showInformationMessage('Done Creating Zip File');

        const settings = await utilities.getEnvBotVariables();

        if (settings.CodeLanguage === constants.sdkLanguages.Csharp) {
            const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
            const csprojFile = csproj[0].fsPath.split('\\').pop();

            const scmCommand = `az webapp config appsettings set --resource-group "${ settings.ResourceGroupName }" --name "${ settings.BotName }" --settings SCM_DO_BUILD_DEPLOYMENT=false`;
            const generatorCommand = `az webapp config appsettings set --resource-group "${ settings.ResourceGroupName }" --name "${ settings.BotName }" --settings SCM_SCRIPT_GENERATOR_ARGS="--aspNetCore ${ csprojFile }"`;
            const prepareDeployCommand = `az bot prepare-deploy --lang Csharp --code-dir "." --proj-file-path "${ csprojFile }"`;
            const publishCommand = `az webapp deployment source config-zip --resource-group "${ settings.ResourceGroupName }" --name "${ settings.BotName }" --src "update.zip"`;

            await executeAzCliCommand(scmCommand, /"name":.*"SCM_DO_BUILD_DEPLOYMENT",[\s\S]*"slotSetting":.*false,/g, 'SET SCM_DO_BUILD_DEPLOYMENT');
            await executeAzCliCommand(generatorCommand, /"name":.*"SCM_SCRIPT_GENERATOR_ARGS",[\s\S]*"slotSetting":.*false,[\s\S]*"value":.*"--aspNetCore/g, 'SET SCM_SCRIPT_GENERATOR');
            await executeAzCliCommand(prepareDeployCommand, /.*/, "Deployment Prep");
            await executeAzCliCommand(publishCommand, /"complete": true,[\s\S]*"deployer": "Push-Deployer",[\s\S]*"progress": ""/g, 'Zip Deployment');
        } else {

        }
        // TODO: Make it work for Node. Add the actual publish commands. Delete zip file.
    },
    async currentTest(): Promise<void> {
        await regexToEnvVariables(`
        "appId": "d23d9a36-1c1c-4fe9-9ad7-9f8eb7664ce0",
        "appPassword": "^B|v}OyJWNn])4grKy#syjpi@",
        "endpoint": "https://vmicrictest.azurewebsites.net/api/messages",
        "id": "vmicricTEST"
      `);
    }
};

async function regexToEnvVariables(data: string): Promise<void> {
    const regexPatterns = [
        constants.regexForVariables.MicrosoftAppId,
        constants.regexForVariables.MicrosoftAppPassword
    ];

    let matches = {};
    
    await regexPatterns.forEach(async (r): Promise<void> => {
        const match = r.exec(data) || { groups: null };
        if (match.groups) {
            matches = {...matches, ...match.groups};
        }
    });

    if (matches) {
        await utilities.setBotVariable(matches);
    }
}

async function executeAzCliCommand(command: string, commandCompleteRegex?: RegExp, commandCompleteTitle: string = 'Command'): Promise<void> {
    const terminal = vscode.window.createTerminal();
    await (terminal as any).onDidWriteData(async (data): Promise<void> => {
        console.log(`DATA: ${ data }`);
        await regexToEnvVariables(data);
        if (commandCompleteRegex && commandCompleteRegex.test(data)) {
            vscode.window.showInformationMessage(`${ commandCompleteTitle } finished successfully. Terminal Closed`);
            terminal.dispose();
        }
    });
    terminal.show(true);
    terminal.sendText(command);
}

export { commands };