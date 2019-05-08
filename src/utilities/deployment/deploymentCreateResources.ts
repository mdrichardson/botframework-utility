import * as constants from '../../constants';
import * as vscode from 'vscode';
import { getCreateResourcesCommand, executeTerminalCommand } from '..';

export default async function deploymentCreateResources(newResourceGroup: boolean, newServicePlan: boolean): Promise<void> {
    const command = await getCreateResourcesCommand(newResourceGroup, newServicePlan);

    vscode.window.showInformationMessage('Creating Azure Resources');
    await executeTerminalCommand(command, constants.regexForDispose.CreateAzureResources, 'Azure Resource Creation');
}