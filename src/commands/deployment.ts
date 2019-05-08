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

const deploymentCommands: Commands = {
    async createAppRegistration(): Promise<void> {
        const command = await getCreateAppRegistrationCommand();

        if (command) {
            vscode.window.showInformationMessage('Creating App Registration');
            await executeTerminalCommand(command, constants.regexForDispose.WebappCreate, 'App Registration Creation');
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
        const deployCommand = await getDeployCommand();

        await createUpdateZip();

        await executeTerminalCommand(prepareDeployCommand, constants.regexForDispose.PrepareDeploy, "Deployment Prep", constants.regexForDispose.DeploymentFailed);
        vscode.window.showInformationMessage('Deploying');
        await executeTerminalCommand(deployCommand, constants.regexForDispose.Deploy, 'Zip Deployment');
    },
};

export { deploymentCommands };