/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import * as fs from 'fs';
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log, getToolsUpdateCommand, getCurrentAzCliVersion, getLatestAzCliVersion, deleteDirectory, createTempDir, getSparseCheckoutCommand, promptForSample, rootFolderIsEmpty, renameDirectory, getSample, createCodeZip, deleteCodeZip, setLocalBotVariables, syncLocalBotVariablesToEnv, getTerminalPath, joinTerminalCommands, handleTerminalData, regexToVariables, getCreateAppRegistrationCommand, normalizeEnvKeys, getEndpointKeyType, getEndpoints, getEndpointObject, promptForNewEndpoint, modifyEndpointNameIfNecessary, getSingleEndpoint, getEndpointFromQuickPick, writeEndpointToEnv, getEmulatorLaunchCommand, loadCommands, handleAzCliUpdate, getPrepareDeployCommand, openSample } from '../src/utilities';
import { testNotify, deleteDownloadTemplates, makeNestedTestDir, deleteCodeFiles, writeCodeFiles, deleteTerminalOutputFile, clearEnvVariables, deletePrepareDeployFiles } from './testUtilities';
import { setVsCodeConfig } from '../src/utilities/variables/setVsCodeConfig';
import { getVsCodeConfig } from '../src/utilities/variables/getVsCodeConfig';
import { CommandOptions } from '../src/interfaces/CommandOptions';
import Axios, { AxiosResponse } from 'axios';
import sinon = require('sinon');
import RandExp = require('randexp');

import * as regexToVariablesToStub from '../src/utilities/deployment/regexToVariables';
import { BotVariables, Endpoint, Sample, SampleLanguage } from '../src/interfaces';
import { EventEmitter } from 'events';
import * as semver from 'semver';
import { getSampleUrl } from '../src/utilities/samples/getSampleUrl';

// Mocha.Setup doesn't seem to work consistently, so we'll force .env and appsettings.json to be watched for changes
watchEnvFiles();

require('./loading');
require('./emulator');
require('./variables');
require('./tools');
require('./samples');
require('./deploymentUnit');
require('./deploymentE2E');

var testEnv: BotVariables = {
    BotName: 'vmicricEXT',
    CodeLanguage: constants.variables.sdkLanguages.Csharp,
    Location: 'westus',
    MicrosoftAppId: '',
    MicrosoftAppPassword: 'TestPassword__0123',
    ResourceGroupName: 'vmicricEXT',
    ServicePlanName: 'vmicricEXT'    
};

const endpoint = 'http://xyz.azurewebsites.net/api/messages';
const appId = new RandExp(constants.regex.forValidations.GUID).gen();
const appPass = new RandExp(constants.regex.forValidations.MicrosoftAppPassword).gen();

const botVariables = {
    Endpoint: endpoint,
    Endpoint_AppId: appId,
    Endpoint_AppPassword: appPass,
    Endpoint_Test: endpoint,
    Endpoint_Test_AppId: appId,
    Endpoint_Test_AppPassword: appPass,
};

const testEndpoint: Endpoint = {
    AppId: appId,
    AppPassword: appPass,
    Host: endpoint,
    Name: 'Endpoint_Test',
};

const testEndpoints = {
    Endpoint_Test: testEndpoint.Host,
    Endpoint_Test_AppId: testEndpoint.AppId,
    Endpoint_Test_AppPassword: testEndpoint.AppPassword,
    Endpoint_Test1: testEndpoint.Host,
    Endpoint_Test1_AppId: testEndpoint.AppId,
    Endpoint_Test1_AppPassword: testEndpoint.AppPassword,
    Endpoint_Test2: testEndpoint.Host,
    Endpoint_Test2_AppId: testEndpoint.AppId,
    Endpoint_Test2_AppPassword: testEndpoint.AppPassword,
};

const suffix = Math.floor(Math.random() * 1000);
const name = `vmicricExtTest${ suffix }`;

var testEnv: BotVariables = {
    BotName: name,
    CodeLanguage: constants.variables.sdkLanguages.Csharp,
    Location: 'westus',
    MicrosoftAppId: '',
    MicrosoftAppPassword: 'AtLeast16Characters____0',
    ResourceGroupName: name,
    ServicePlanName: name    
};


// suite("Quick Test", function(): void {
//     teardown((): void => {
//         sinon.restore();
//     });
//     test("Should Get Endpoint Variables - Node", async function(): Promise<void> {
//         this.timeout(5 * 1000);
//         await clearEnvVariables();
//         await writeCodeFiles(constants.variables.sdkLanguages.Node);
//         await setBotVariables(botVariables);

//         const localVariables = await getLocalBotVariables();

//         assert.equal(localVariables['Endpoint'], endpoint);
//         assert.equal(localVariables['Endpoint_AppId'], appId);
//         assert.equal(localVariables['Endpoint_AppPassword'], appPass);
//         assert.equal(localVariables['Endpoint_Test'], endpoint);
//         assert.equal(localVariables['Endpoint_Test_AppId'], appId);
//         assert.equal(localVariables['Endpoint_Test_AppPassword'], appPass);
//     });
// });
