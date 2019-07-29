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
// require('./deploymentE2E');

// var testEnv: BotVariables = {
//     BotName: 'vmicricEXT',
//     CodeLanguage: constants.variables.sdkLanguages.Csharp,
//     Location: 'westus',
//     MicrosoftAppId: '',
//     MicrosoftAppPassword: 'TestPassword__0123',
//     ResourceGroupName: 'vmicricEXT',
//     ServicePlanName: 'vmicricEXT'    
// };

// const endpoint = 'http://xyz.azurewebsites.net/api/messages';
// const appId = new RandExp(constants.regex.forValidations.GUID).gen();
// const appPass = new RandExp(constants.regex.forValidations.MicrosoftAppPassword).gen();

// const botVariables = {
//     Endpoint: endpoint,
//     Endpoint_AppId: appId,
//     Endpoint_AppPassword: appPass,
//     Endpoint_Test: endpoint,
//     Endpoint_Test_AppId: appId,
//     Endpoint_Test_AppPassword: appPass,
// };

// const testEndpoint: Endpoint = {
//     AppId: appId,
//     AppPassword: appPass,
//     Host: endpoint,
//     Name: 'Endpoint_Test',
// };

// const testEndpoints = {
//     Endpoint_Test: testEndpoint.Host,
//     Endpoint_Test_AppId: testEndpoint.AppId,
//     Endpoint_Test_AppPassword: testEndpoint.AppPassword,
//     Endpoint_Test1: testEndpoint.Host,
//     Endpoint_Test1_AppId: testEndpoint.AppId,
//     Endpoint_Test1_AppPassword: testEndpoint.AppPassword,
//     Endpoint_Test2: testEndpoint.Host,
//     Endpoint_Test2_AppId: testEndpoint.AppId,
//     Endpoint_Test2_AppPassword: testEndpoint.AppPassword,
// };

// const suffix = Math.floor(Math.random() * 1000);
// const name = `vmicricExtTest${ suffix }`;

// var testEnv: BotVariables = {
//     BotName: name,
//     CodeLanguage: constants.variables.sdkLanguages.Csharp,
//     Location: 'westus',
//     MicrosoftAppId: '',
//     MicrosoftAppPassword: 'AtLeast16Characters____0',
//     ResourceGroupName: name,
//     ServicePlanName: name    
// };


// suite("Quick Test", function(): void {
//     teardown((): void => {
//         sinon.restore();
//     });
//     test("Should Return undefined if User Prompted for Name and Dismissed", async function(): Promise<void> {
//         await clearEnvVariables();

//         const promptStub = sinon.stub(vscode.window, 'showInputBox');
//         promptStub.resolves(undefined);

//         const endpoint = await promptForNewEndpoint();
//         assert.equal(endpoint, undefined);      
//     });
//     test("Should Return an Endpoint Object after Prompting for an Endpoint - No AppId/Pass/Host - Correct Format", async function(): Promise<void> {
//         this.timeout(5 * 1000);
//         await clearEnvVariables();

//         const promptStub = sinon.stub(vscode.window, 'showInputBox');
//         promptStub.onCall(0).resolves(testEndpoint.Name);
//         promptStub.onCall(1).resolves(testEndpoint.AppId);
//         promptStub.onCall(2).resolves(testEndpoint.AppPassword);
//         promptStub.onCall(3).resolves(testEndpoint.Host);

//         const endpoint = (await promptForNewEndpoint() as Endpoint);

//         assert.equal(endpoint.AppId, testEndpoint.AppId);
//         assert.equal(endpoint.AppPassword, testEndpoint.AppPassword);
//         assert.equal(endpoint.Host, testEndpoint.Host);
//         assert.equal(endpoint.Name, testEndpoint.Name);
//     });
//     test("Should Return Appropriate Endpoint from QuickPick", async function(): Promise<void> {
//         await clearEnvVariables();

//         const promptStub = sinon.stub(vscode.window, 'showQuickPick');
//         promptStub.resolves(('Endpoint_Test2' as unknown as vscode.QuickPickItem));

//         await setBotVariables(testEndpoints);

//         const endpoint = (await getEndpointFromQuickPick(await getEndpoints()) as Endpoint);
//         assert.equal(endpoint.AppId, testEndpoints.Endpoint_Test2_AppId);
//         assert.equal(endpoint.AppPassword, testEndpoints.Endpoint_Test2_AppPassword);
//         assert.equal(endpoint.Host, testEndpoints.Endpoint_Test2);
//         assert.equal(endpoint.Name, 'Endpoint_Test2');  
//     });
//     test("Should Write a New Endpoint to Local and Env", async function(): Promise<void> {
//         this.timeout(99 *1000);
//         await clearEnvVariables();

//         await writeEndpointToEnv(testEndpoint);

//         const localSettings = await getLocalBotVariables();
//         const envSettings = await getEnvBotVariables();

//         assert.equal(localSettings[testEndpoint.Name], testEndpoint.Host);
//         assert.equal(localSettings[`${ testEndpoint.Name }_${ constants.regex.endpointSuffixes.AppId }`], testEndpoint.AppId);
//         assert.equal(localSettings[`${ testEndpoint.Name }_${ constants.regex.endpointSuffixes.AppPassword }`], testEndpoint.AppPassword);
//         assert.equal(envSettings[testEndpoint.Name], testEndpoint.Host);
//         assert.equal(envSettings[`${ testEndpoint.Name }_${ constants.regex.endpointSuffixes.AppId }`], testEndpoint.AppId);
//         assert.equal(envSettings[`${ testEndpoint.Name }_${ constants.regex.endpointSuffixes.AppPassword }`], testEndpoint.AppPassword);
//     });
//     test("Should get the latest version of AZ CLI", async function(): Promise<void> {
//         this.timeout(5 * 1000);

//         const version = await getLatestAzCliVersion();
//         assert(typeof version === 'string');
//         assert.notEqual(version, '0.0.0');
//     });
//     test('Should Get Appropriate Tools Update Command - No Exclusions', async function(): Promise<void> {
//         this.timeout(20 * 1000);

//         await setVsCodeConfig(constants.vsCodeConfig.names.excludeCliToolsFromUpdate, []);
//         const command = await getToolsUpdateCommand();
//         const toUpdate = constants.terminal.cliTools.slice(1);
//         assert.equal(command, `npm install -g ${ toUpdate.join(' ') }`);
//     });
// });
