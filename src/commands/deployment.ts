import * as constants from '../constants';
import * as vscode from 'vscode';

import { Commands } from '../interfaces';
import { 
    getCreateAppRegistrationCommand, 
    executeTerminalCommand, 
    deploymentCreateResources, 
    getPrepareDeployCommand, 
    getDeployCommand,
    createUpdateZip } from '../utilities';
import { CommandOptions } from '../interfaces/CommandOptions';

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