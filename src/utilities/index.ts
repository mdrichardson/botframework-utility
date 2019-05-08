
import createUpdateZip from './deployment/createUpdateZip';
import deleteUpdateZip from './deployment/deleteUpdateZip';
import deploymentCreateResources from './deployment/deploymentCreateResources';
import downloadTemplate from './deployment/downloadTemplate';
import executeTerminalCommand from './deployment/executeTerminalCommand';
import getCreateAppRegistrationCommand from './deployment/getCreateAppRegistrationCommand';
import getCreateResourcesCommand from './deployment/getCreateResourcesCommand';
import getDeployCommand from './deployment/getDeployCommand';
import getDeploymentTemplate from './deployment/getDeploymentTemplate';
import getPrepareDeployCommand from './deployment/getPrepareDeployCommand';
import regexToEnvVariables from './deployment/regexToEnvVariables';

import getEmulatorLaunchCommand from './emulator/getEmulatorLaunchCommand';

import arrayToRegex from './variables/arrayToRegex';
import getEnvBotVariables from './variables/getEnvBotVariables';
import getLanguage from './variables/getLanguage';
import getLocalBotVariables from './variables/getLocalBotVariables';
import getPromptAndValidator from './variables/getPromptAndValidator';
import getWorkspaceRoot from './variables/getWorkspaceRoot';
import inputIsValid from './variables/inputIsValid';
import normalizeEnvKeys from './variables/normalizeEnvKeys';
import promptForVariableIfNotExist from './variables/promptForVariableIfNotExist';
import setBotVariable from './variables/setBotVariables';
import setEnvBotVariables from './variables/setEnvBotVariables';
import setLocalBotVariables from './variables/setLocalBotVariables';
import { syncLocalBotVariablesToEnv } from './variables/syncLocalBotVariablesToEnv';

export {
    createUpdateZip,
    deleteUpdateZip,
    deploymentCreateResources,
    downloadTemplate,
    executeTerminalCommand,
    getCreateAppRegistrationCommand,
    getCreateResourcesCommand,
    getDeployCommand,
    getDeploymentTemplate,
    getPrepareDeployCommand,
    regexToEnvVariables,
    getEmulatorLaunchCommand,
    arrayToRegex,
    getEnvBotVariables,
    getLanguage,
    getLocalBotVariables,
    getPromptAndValidator,
    getWorkspaceRoot,
    inputIsValid,
    normalizeEnvKeys,
    promptForVariableIfNotExist,
    setBotVariable,
    setEnvBotVariables,
    setLocalBotVariables,
    syncLocalBotVariablesToEnv
};