import * as constants from '../../constants';
import { promptForVariableIfNotExist, getEnvBotVariables } from '..';

export default async function getDeployCommand(): Promise<string> {
    await promptForVariableIfNotExist(constants.envVars.BotName);
    await promptForVariableIfNotExist(constants.envVars.ResourceGroupName);

    const settings = getEnvBotVariables();

    return `az webapp deployment source config-zip --resource-group "${ settings.ResourceGroupName }" --name "${ settings.BotName }" --src "${ constants.zipFileName }"`;
}