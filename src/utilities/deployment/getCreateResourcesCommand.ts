import * as constants from '../../constants';
import { promptForVariableIfNotExist, getEnvBotVariables, getDeploymentTemplate } from '..';

export default async function getCreateResourcesCommand(newResourceGroup: boolean, newServicePlan: boolean): Promise<string> {
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