import * as vscode from 'vscode';
import * as constants from '../constants';
import { CommandOptions } from '../interfaces/CommandOptions';
import { Commands } from '../interfaces/Commands';
import { getCreateAppRegistrationCommand, executeTerminalCommand, createAzureResources, getPrepareDeployCommand, getDeployCommand, createCodeZip } from '../utilities';

const deploymentCommands: Commands = {
    async createAppRegistration(): Promise<void> {
        const command = await getCreateAppRegistrationCommand();
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.WebappCreate,
            commandTitle: 'App Registration Creation'
        };

        if (command) {
            vscode.window.showInformationMessage('Creating App Registration');
            await executeTerminalCommand(command, options);
        }
    },
    // Can't pass args to menu commands, so we'll call the "parent" deployment function
    async createAzureResourcesExistingResourceGroupExistingServicePlan(): Promise<void> {
        await createAzureResources(false, false);
    },
    async createAzureResourcesExistingResourceGroupNewServicePlan(): Promise<void> {
        await createAzureResources(false, true);
    },
    async createAzureResourcesNewResourceGroup(): Promise<void> {
        await createAzureResources(true, true);
    },
    async deploymentDeploy(): Promise<void> {

        const prepareDeployCommand = await getPrepareDeployCommand();
        const prepareDeployOptions: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.PrepareDeploy,
            commandFailedRegex: constants.regex.forDispose.PrepareDeployFailed,
            commandTitle: 'Deployment Prep'
        };
        const deployCommand = await getDeployCommand();
        const deployOptions: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.Deploy,
            commandFailedRegex: constants.regex.forDispose.DeployFailed,
            commandTitle: 'Zip Deployment'
        };

        await createCodeZip();

        await executeTerminalCommand(prepareDeployCommand, prepareDeployOptions);
        vscode.window.showInformationMessage('Deploying');
        await executeTerminalCommand(deployCommand, deployOptions);
    },
};

export { deploymentCommands };