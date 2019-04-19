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
            vscode.window.showInformationMessage(`You already have an App Registration. Delete appId/appPass.`);
            return;
        }

        await utilities.promptForVariableIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.promptForVariableIfNotExist(constants.envVars.MicrosoftAppPassword, constants.envVarPrompts.MicrosoftAppPasswordBeingCreated);

        settings = await utilities.getEnvBotVariables();

        const command = `az ad app create --display-name "${ settings.BotName }" --password "${ settings.MicrosoftAppPassword }" --available-to-other-tenants`;

        vscode.window.showInformationMessage('Creating App Registration');
        await executeAzCliCommand(command, constants.regexForDispose.WebappCreate, 'App Registration Creation');
    },
    // Can't pass args to menu commands, so we'll call the "parent" deployment function
    async deploymentCreateResourcesNewResourceGroup(): Promise<void> {
        await deploymentCreateResources(true, true);
    },
    async deploymentCreateResourcesExistingResourceGroupExistingServicePlan(): Promise<void> {
        await deploymentCreateResources(false, false);
    },
    async deploymentCreateResourcesExistingResourceGroupNewServicePlan(): Promise<void> {
        await deploymentCreateResources(false, true);
    },
    async deploymentPublish(): Promise<void> {

        await utilities.promptForVariableIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
        await utilities.promptForVariableIfNotExist(constants.envVars.ResourceGroupName, constants.envVarPrompts.ResourceGroupName);
        await utilities.promptForVariableIfNotExist(constants.envVars.CodeLanguage, constants.envVarPrompts.CodeLanguage);

        vscode.window.showInformationMessage('Creating Zip File');
        const root = utilities.getWorkspaceRoot();
        await zip.zip(root, `${ root }/update.zip`);
        vscode.window.showInformationMessage('Done Creating Zip File');

        const settings = await utilities.getEnvBotVariables();

        let csprojFile;
        if (settings.CodeLanguage === constants.sdkLanguages.Csharp) {
            const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
            csprojFile = csproj[0].fsPath.split('\\').pop();
        }

        const cSharpArg = csprojFile ? `--proj-file-path "${ csprojFile }"` : '';
        const prepareDeployCommand = `az bot prepare-deploy --lang ${ settings.CodeLanguage } --code-dir "." ${ cSharpArg }`;
        const publishCommand = `az webapp deployment source config-zip --resource-group "${ settings.ResourceGroupName }" --name "${ settings.BotName }" --src "update.zip"`;

        await executeAzCliCommand(prepareDeployCommand, constants.regexForDispose.PreparePublish, "Deployment Prep", constants.regexForDispose.PreparePublishFailed);
        vscode.window.showInformationMessage('Deploying');
        await executeAzCliCommand(publishCommand, constants.regexForDispose.Publish, 'Zip Deployment');
        // TODO: Exclude update.zip in zip file. Higher zip compression? Delete zip file.
    },
    async currentTest(): Promise<void> {
        const test = vscode.workspace.getConfiguration('botframework-utility').get('customTerminalForAzCommandsPath');
        console.log(JSON.stringify(test));
    }
};

async function deploymentCreateResources(newResourceGroup: boolean, newServicePlan: boolean): Promise<void> {
    // TODO: Allow for *all* variables (various locations...)
    // Force creation of new service plan if creating new resource group
    newServicePlan = newResourceGroup ? true : newServicePlan;

    await utilities.promptForVariableIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location);
    await utilities.promptForVariableIfNotExist(constants.envVars.MicrosoftAppId, constants.envVarPrompts.MicrosoftAppId);
    await utilities.promptForVariableIfNotExist(constants.envVars.MicrosoftAppPassword, constants.envVarPrompts.MicrosoftAppPassword);
    await utilities.promptForVariableIfNotExist(constants.envVars.BotName, constants.envVarPrompts.BotName);
    await utilities.promptForVariableIfNotExist(constants.envVars.ServicePlanName, constants.envVarPrompts.ServicePlanName);

    const rgPrompt = newResourceGroup ? constants.envVarPrompts.ResourceGroupNameBeingCreated : constants.envVarPrompts.ResourceGroupName;
    await utilities.promptForVariableIfNotExist(constants.envVars.ResourceGroupName, rgPrompt);

    const planPrompt = newServicePlan ? constants.envVarPrompts.ServicePlanNameBeingCreated : constants.envVarPrompts.ServicePlanName;
    await utilities.promptForVariableIfNotExist(constants.envVars.ServicePlanName, planPrompt);

    const settings = await utilities.getEnvBotVariables();

    const azCommand = newResourceGroup ? `deployment create --location ${ settings.Location }` : 'group deployment create';
    
    const templateName = newResourceGroup ? constants.deploymentTemplates["template-with-new-rg.json"] : constants.deploymentTemplates["template-with-preexisting-rg.json"];
    const deploymentTemplate = await utilities.getDeploymentTemplate(templateName);

    const groupParam = newResourceGroup ? `groupName="${ settings.ResourceGroupName }" groupLocation="${ settings.Location }"` : '';
    const groupArg = newResourceGroup ? '' : `--resource-group "${ settings.ResourceGroupName }" `;

    const servicePlanParam = newServicePlan ? 
        `newAppServicePlanName="${ settings.ServicePlanName }" appServicePlanLocation="${ settings.Location }"` : 
        `existingAppServicePlan="${ settings.ServicePlanName }" appServicePlanLocation="${ settings.Location }"`;

    const command = `az ${ azCommand } --name "${ settings.BotName }" --template-file "${ deploymentTemplate }" ${ groupArg }`+
        `--parameters appId="${ settings.MicrosoftAppId }" appSecret="${ settings.MicrosoftAppPassword }" botId="${ settings.BotName }" `+
        `botSku=F0 newWebAppName="${ settings.BotName }" ${ groupParam } ${ servicePlanParam }`;

    vscode.window.showInformationMessage('Creating Azure Resources');
    await executeAzCliCommand(command, constants.regexForDispose.CreateAzureResources, 'Azure Resource Creation');
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

async function executeAzCliCommand(
    command: string,
    commandCompleteRegex?: RegExp,
    commandTitle: string = 'Command',
    commandFailedRegex?: RegExp): Promise<void> {
    // Force all commands to use single terminal type, for better control
    const userTerminalPath = (vscode.workspace.getConfiguration('botframework-utility').get('customTerminalForAzCommandsPath') as string);
    let terminalPath = userTerminalPath ? userTerminalPath : undefined;
    if (command.toLowerCase().startsWith('az') && !userTerminalPath) {
        switch (process.platform) {
            case 'win32':
                terminalPath = 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe';
                break;
            case 'darwin':
                terminalPath = '/bin/bash';
                break;
            default:
                terminalPath = 'sh';
        }
    };
    const terminal = await vscode.window.createTerminal(undefined, terminalPath);
    let listenForData = true;
    (terminal as any).onDidWriteData(async (data): Promise<void> => {
        if (listenForData) {
            await regexToEnvVariables(data);
            if (data.trim() && commandFailedRegex && commandFailedRegex.test(data)) {
                vscode.window.showErrorMessage(`${ commandTitle } failed.`);
                // Ensure we don't call a success message
                terminal.dispose();
                listenForData = false;
            } else if (data.trim() && commandCompleteRegex && commandCompleteRegex.test(data)) {
                vscode.window.showInformationMessage(`${ commandTitle } finished successfully. Terminal Closed`);
                terminal.dispose();
            }
        }
    });
    terminal.show(true);
    terminal.sendText(command, true);
}

export { commands };