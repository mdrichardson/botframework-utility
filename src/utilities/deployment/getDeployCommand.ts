import * as constants from '../../constants';
import { promptForVariableIfNotExist, getEnvBotVariables } from '..';

export async function getDeployCommand(): Promise<string> {
    await promptForVariableIfNotExist(constants.variables.botVariables.BotName);
    await promptForVariableIfNotExist(constants.variables.botVariables.ResourceGroupName);

    const settings = getEnvBotVariables();

    return `az webapp deployment source config-zip --resource-group "${ settings.ResourceGroupName }" --name "${ settings.BotName }" --src "${ constants.files.zip }"`;
}