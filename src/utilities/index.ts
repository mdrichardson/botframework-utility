
import createUpdateZip from './deployment/createUpdateZip';
import deleteUpdateZip from './deployment/deleteUpdateZip';
import createAzureResources from './deployment/createAzureResources';
import downloadTemplate from './deployment/downloadTemplate';
import executeTerminalCommand from './deployment/executeTerminalCommand';
import getCreateAppRegistrationCommand from './deployment/getCreateAppRegistrationCommand';
import getCreateResourcesCommand from './deployment/getCreateResourcesCommand';
import getDeployCommand from './deployment/getDeployCommand';
import getDeploymentTemplate from './deployment/getDeploymentTemplate';
import getPrepareDeployCommand from './deployment/getPrepareDeployCommand';
import regexToVariables from './deployment/regexToVariables';

import getEmulatorLaunchCommand from './emulator/getEmulatorLaunchCommand';

import log from './loading/log';
import loadCommands from './loading/loadCommands';
import watchEnvFiles from './loading/watchEnvFiles';

import arrayToRegex from './variables/arrayToRegex';
import getEnvBotVariables from './variables/getEnvBotVariables';
import getLanguage from './variables/getLanguage';
import getLocalBotVariables from './variables/getLocalBotVariables';
import getPromptAndValidator from './variables/getPromptAndValidator';
import getWorkspaceRoot from './variables/getWorkspaceRoot';
import inputIsValid from './variables/inputIsValid';
import normalizeEnvKeys from './variables/normalizeEnvKeys';
import promptForVariableIfNotExist from './variables/promptForVariableIfNotExist';
import setBotVariables from './variables/setBotVariables';
import setEnvBotVariables from './variables/setEnvBotVariables';
import setLocalBotVariables from './variables/setLocalBotVariables';
import syncLocalBotVariablesToEnv from './variables/syncLocalBotVariablesToEnv';

export {
    createUpdateZip,
    deleteUpdateZip,
    createAzureResources,
    downloadTemplate,
    executeTerminalCommand,
    getCreateAppRegistrationCommand,
    getCreateResourcesCommand,
    getDeployCommand,
    getDeploymentTemplate,
    getPrepareDeployCommand,
    regexToVariables,
    getEmulatorLaunchCommand,
    loadCommands,
    log,
    watchEnvFiles,
    arrayToRegex,
    getEnvBotVariables,
    getLanguage,
    getLocalBotVariables,
    getPromptAndValidator,
    getWorkspaceRoot,
    inputIsValid,
    normalizeEnvKeys,
    promptForVariableIfNotExist,
    setBotVariables,
    setEnvBotVariables,
    setLocalBotVariables,
    syncLocalBotVariablesToEnv
};