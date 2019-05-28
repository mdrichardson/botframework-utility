import * as constants from '../../constants';
import * as vscode from 'vscode';
import { getCreateResourcesCommand, executeTerminalCommand } from '..';
import { CommandOptions } from '../../interfaces/CommandOptions';

export async function createAzureResources(newResourceGroup: boolean, newServicePlan: boolean): Promise<void> {
    const command = await getCreateResourcesCommand(newResourceGroup, newServicePlan);

    vscode.window.showInformationMessage('Creating Azure Resources');
    const options: CommandOptions = {
        commandCompleteRegex: constants.regex.forDispose.CreateAzureResources,
        commandFailedRegex: constants.regex.forDispose.CreateAzureResourcesError,
        commandTitle: 'Azure Resource Creation'
    };
    await executeTerminalCommand(command, options);
}