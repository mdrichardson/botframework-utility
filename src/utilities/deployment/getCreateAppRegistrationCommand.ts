import * as constants from '../../constants';
import * as vscode from 'vscode';
import { getEnvBotVariables, promptForVariableIfNotExist } from '..';

export async function getCreateAppRegistrationCommand(): Promise<string|void> {
    let settings = getEnvBotVariables();

    if (settings.MicrosoftAppId && settings.MicrosoftAppPassword) {
        vscode.window.showInformationMessage(`You already have an App Registration. Delete appId/appPass.`);
        return;
    }

    await promptForVariableIfNotExist(constants.variables.botVariables.BotName);
    await promptForVariableIfNotExist(constants.variables.botVariables.MicrosoftAppPassword);

    settings = getEnvBotVariables();

    return `az ad app create --display-name "${ settings.BotName }" --password "${ settings.MicrosoftAppPassword }" --available-to-other-tenants`;
}