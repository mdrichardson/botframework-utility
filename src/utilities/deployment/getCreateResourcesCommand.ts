import * as constants from '../../constants';
import { promptForVariableIfNotExist, getEnvBotVariables, getDeploymentTemplate } from '..';

export async function getCreateResourcesCommand(newResourceGroup: boolean, newServicePlan: boolean): Promise<string> {
    // Force creation of new service plan if creating new resource group
    newServicePlan = newResourceGroup ? true : newServicePlan;

    await promptForVariableIfNotExist(constants.variables.botVariables.Location);
    await promptForVariableIfNotExist(constants.variables.botVariables.MicrosoftAppId);
    await promptForVariableIfNotExist(constants.variables.botVariables.MicrosoftAppPassword);
    await promptForVariableIfNotExist(constants.variables.botVariables.BotName);
    await promptForVariableIfNotExist(constants.variables.botVariables.ServicePlanName);

    const rgPrompt = newResourceGroup ? constants.variables.botVariablePrompts.ResourceGroupNameBeingCreated : constants.variables.botVariablePrompts.ResourceGroupName;
    await promptForVariableIfNotExist(constants.variables.botVariables.ResourceGroupName, { prompt: rgPrompt.prompt, regexValidator: rgPrompt.validator });

    const planPrompt = newServicePlan ? constants.variables.botVariablePrompts.ServicePlanNameBeingCreated : constants.variables.botVariablePrompts.ServicePlanName;
    await promptForVariableIfNotExist(constants.variables.botVariables.ServicePlanName, { prompt: planPrompt.prompt, regexValidator: planPrompt.validator });

    const settings = getEnvBotVariables();

    const azCommand = newResourceGroup ? `deployment create --location ${ settings.Location }` : 'group deployment create';
    
    const templateName = newResourceGroup ? constants.deployment.templates["template-with-new-rg.json"] : constants.deployment.templates["template-with-preexisting-rg.json"];
    const deploymentTemplate = await getDeploymentTemplate(templateName);

    const groupParam = newResourceGroup ? `groupName="${ settings.ResourceGroupName }" groupLocation="${ settings.Location }" ` : '';
    const groupArg = newResourceGroup ? '' : `--resource-group "${ settings.ResourceGroupName }" `;

    const servicePlanLocationParam = newResourceGroup ? 'newAppServicePlanLocation' : 'appServicePlanLocation';

    const servicePlanParam = newServicePlan ? 
        `newAppServicePlanName="${ settings.ServicePlanName }" ${ servicePlanLocationParam }="${ settings.Location }"` : 
        `existingAppServicePlan="${ settings.ServicePlanName }" ${ servicePlanLocationParam }="${ settings.Location }"`;

    return `az ${ azCommand } --name "${ settings.BotName }" --template-file "${ deploymentTemplate }" ${ groupArg }`+
        `--parameters appId="${ settings.MicrosoftAppId }" appSecret="${ settings.MicrosoftAppPassword }" botId="${ settings.BotName }" `+
        `botSku=F0 newWebAppName="${ settings.BotName }" ${ groupParam }${ servicePlanParam }`;
}