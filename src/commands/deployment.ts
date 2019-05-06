import * as constants from '../constants';
import * as vscode from 'vscode';

import {
    createUpdateZip,
    getDeploymentTemplate,
    getEnvBotVariables,
    promptForVariableIfNotExist,
    setBotVariable
} from '../utilities/index';

import { Commands } from '../interfaces';

const deploymentCommands: Commands = {
    async createAppRegistration(): Promise<void> {
        const command = await getCreateAppRegistrationCommand();

        if (command) {
            vscode.window.showInformationMessage('Creating App Registration');
            await executeTerminalCommand(command, constants.regexForDispose.WebappCreate, 'App Registration Creation');
        }
    },
    // Can't pass args to menu commands, so we'll call the "parent" deployment function
    async deploymentCreateResourcesExistingResourceGroupExistingServicePlan(): Promise<void> {
        await deploymentCreateResources(false, false);
    },
    async deploymentCreateResourcesExistingResourceGroupNewServicePlan(): Promise<void> {
        await deploymentCreateResources(false, true);
    },
    async deploymentCreateResourcesNewResourceGroup(): Promise<void> {
        await deploymentCreateResources(true, true);
    },
    async deploymentDeploy(): Promise<void> {

        const prepareDeployCommand = await getPrepareDeployCommand();
        const deployCommand = await getDeployCommand();

        await executeTerminalCommand(prepareDeployCommand, constants.regexForDispose.PrepareDeploy, "Deployment Prep", constants.regexForDispose.DeploymentFailed);
        vscode.window.showInformationMessage('Deploying');
        await executeTerminalCommand(deployCommand, constants.regexForDispose.Deploy, 'Zip Deployment');
    },
};

async function deploymentCreateResources(newResourceGroup: boolean, newServicePlan: boolean): Promise<void> {
    // TODO: Allow for *all* variables (various locations...)
    const command = await getCreateResourcesCommand(newResourceGroup, newServicePlan);

    vscode.window.showInformationMessage('Creating Azure Resources');
    await executeTerminalCommand(command, constants.regexForDispose.CreateAzureResources, 'Azure Resource Creation');
}

export async function regexToEnvVariables(data: string): Promise<void> {
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
        await setBotVariable(matches);
    }
}

export async function executeTerminalCommand(
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
    }
    const terminal = await vscode.window.createTerminal(undefined, terminalPath);
    let listenForData = true;
    (terminal as any).onDidWriteData(async (data): Promise<void> => {
        if (listenForData) {
            await regexToEnvVariables(data);
            if (data.trim() && commandFailedRegex && commandFailedRegex.test(data)) {
                vscode.window.showErrorMessage(`${ commandTitle } failed.`);
                // Ensure we don't call a success message
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

export async function getCreateAppRegistrationCommand(): Promise<string|void> {
    let settings = await getEnvBotVariables();

    if (settings.MicrosoftAppId && settings.MicrosoftAppPassword) {
        vscode.window.showInformationMessage(`You already have an App Registration. Delete appId/appPass.`);
        return;
    }

    await promptForVariableIfNotExist(constants.envVars.BotName);
    await promptForVariableIfNotExist(constants.envVars.MicrosoftAppPassword);

    settings = await getEnvBotVariables();

    return `az ad app create --display-name "${ settings.BotName }" --password "${ settings.MicrosoftAppPassword }" --available-to-other-tenants`;
}

export async function getCreateResourcesCommand(newResourceGroup: boolean, newServicePlan: boolean): Promise<string> {
    // Force creation of new service plan if creating new resource group
    newServicePlan = newResourceGroup ? true : newServicePlan;

    await promptForVariableIfNotExist(constants.envVars.Location);
    await promptForVariableIfNotExist(constants.envVars.MicrosoftAppId);
    await promptForVariableIfNotExist(constants.envVars.MicrosoftAppPassword);
    await promptForVariableIfNotExist(constants.envVars.BotName);
    await promptForVariableIfNotExist(constants.envVars.ServicePlanName);

    const rgPrompt = newResourceGroup ? constants.envVarPrompts.ResourceGroupNameBeingCreated : constants.envVarPrompts.ResourceGroupName;
    await promptForVariableIfNotExist(constants.envVars.ResourceGroupName, rgPrompt.prompt, rgPrompt.validator);

    const planPrompt = newServicePlan ? constants.envVarPrompts.ServicePlanNameBeingCreated : constants.envVarPrompts.ServicePlanName;
    await promptForVariableIfNotExist(constants.envVars.ServicePlanName, planPrompt.prompt, planPrompt.validator);

    const settings = await getEnvBotVariables();

    const azCommand = newResourceGroup ? `deployment create --location ${ settings.Location }` : 'group deployment create';
    
    const templateName = newResourceGroup ? constants.deploymentTemplates["template-with-new-rg.json"] : constants.deploymentTemplates["template-with-preexisting-rg.json"];
    const deploymentTemplate = await getDeploymentTemplate(templateName);

    const groupParam = newResourceGroup ? `groupName="${ settings.ResourceGroupName }" groupLocation="${ settings.Location }"` : '';
    const groupArg = newResourceGroup ? '' : `--resource-group "${ settings.ResourceGroupName }" `;

    const servicePlanLocationParam = newResourceGroup ? 'newAppServicePlanLocation' : 'appServicePlanLocation';

    const servicePlanParam = newServicePlan ? 
        `newAppServicePlanName="${ settings.ServicePlanName }" ${ servicePlanLocationParam }="${ settings.Location }"` : 
        `existingAppServicePlan="${ settings.ServicePlanName }" ${ servicePlanLocationParam }="${ settings.Location }"`;

    return `az ${ azCommand } --name "${ settings.BotName }" --template-file "${ deploymentTemplate }" ${ groupArg }`+
        `--parameters appId="${ settings.MicrosoftAppId }" appSecret="${ settings.MicrosoftAppPassword }" botId="${ settings.BotName }" `+
        `botSku=F0 newWebAppName="${ settings.BotName }" ${ groupParam } ${ servicePlanParam }`;
}

export async function getPrepareDeployCommand(): Promise<string> {
    await promptForVariableIfNotExist(constants.envVars.CodeLanguage);
    
    const settings = await getEnvBotVariables();

    let csprojFile;
    if (settings.CodeLanguage === constants.sdkLanguages.Csharp) {
        const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
        csprojFile = csproj[0].fsPath.split('\\').pop();
    }

    const cSharpArg = csprojFile ? `--proj-file-path "${ csprojFile }"` : '';
    return `az bot prepare-deploy --lang ${ settings.CodeLanguage } --code-dir "." ${ cSharpArg }`;
}

export async function getDeployCommand(): Promise<string> {
    await promptForVariableIfNotExist(constants.envVars.BotName);
    await promptForVariableIfNotExist(constants.envVars.ResourceGroupName);

    await createUpdateZip();

    const settings = await getEnvBotVariables();

    return `az webapp deployment source config-zip --resource-group "${ settings.ResourceGroupName }" --name "${ settings.BotName }" --src "code.zip"`;
}

export { deploymentCommands };