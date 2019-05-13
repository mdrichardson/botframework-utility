import * as vscode from 'vscode';

import { CommandOptions } from '../interfaces/CommandOptions';
import { Commands } from '../interfaces/Commands';
import * as constants from '../constants';
import getCreateAppRegistrationCommand from '../utilities/deployment/getCreateAppRegistrationCommand';
import executeTerminalCommand from '../utilities/deployment/executeTerminalCommand';
import createAzureResources from '../utilities/deployment/createAzureResources';
import getPrepareDeployCommand from '../utilities/deployment/getPrepareDeployCommand';
import getDeployCommand from '../utilities/deployment/getDeployCommand';
import createUpdateZip from '../utilities/deployment/createUpdateZip';

const deploymentCommands: Commands = {
    async createAppRegistration(): Promise<void> {
        const command = await getCreateAppRegistrationCommand();
        const options: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.WebappCreate,
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
            commandCompleteRegex: constants.regexForDispose.PrepareDeploy,
            commandFailedRegex: constants.regexForDispose.PrepareDeployFailed,
            commandTitle: 'Deployment Prep'
        };
        const deployCommand = await getDeployCommand();
        const deployOptions: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.Deploy,
            commandTitle: 'Zip Deployment'
        };

        await createUpdateZip();

        await executeTerminalCommand(prepareDeployCommand, prepareDeployOptions);
        vscode.window.showInformationMessage('Deploying');
        await executeTerminalCommand(deployCommand, deployOptions);
    },
};

export { deploymentCommands };