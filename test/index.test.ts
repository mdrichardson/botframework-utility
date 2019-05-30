/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log, getToolsUpdateCommand, getCurrentAzCliVersion, getLatestAzCliVersion, deleteDirectory, createTempDir, getSparseCheckoutCommand, promptForSample, rootFolderIsEmpty, renameDirectory, getSample, createCodeZip, deleteCodeZip, setLocalBotVariables, syncLocalBotVariablesToEnv, getTerminalPath, joinTerminalCommands, handleTerminalData, regexToVariables, getCreateAppRegistrationCommand, normalizeEnvKeys, getEndpointKeyType, getEndpoints, getEndpointObject } from '../src/utilities';
import { testNotify, deleteDownloadTemplates, makeNestedTestDir, deleteCodeFiles, writeCodeFiles, deleteTerminalOutputFile, clearEnvVariables } from './testUtilities';
import { setVsCodeConfig } from '../src/utilities/variables/setVsCodeConfig';
import { getVsCodeConfig } from '../src/utilities/variables/getVsCodeConfig';
import { CommandOptions } from '../src/interfaces/CommandOptions';
import Axios, { AxiosResponse } from 'axios';
import sinon = require('sinon');
import RandExp = require('randexp');

import * as regexToVariablesToStub from '../src/utilities/deployment/regexToVariables';
import { BotVariables } from '../src/interfaces';


// Mocha.Setup doesn't seem to work consistently, so we'll force .env and appsettings.json to be watched for changes
watchEnvFiles();

require('./loading');
require('./emulator');
require('./variables');
require('./tools');
require('./samples');
require('./deploymentUnit');
// require('./deploymentE2E');  -- 5/20: ran out of app registrations
// var testEnv: BotVariables = {
//     BotName: 'vmicricEXT',
//     CodeLanguage: constants.variables.sdkLanguages.Csharp,
//     Location: 'westus',
//     MicrosoftAppId: '',
//     MicrosoftAppPassword: 'TestPassword__0123',
//     ResourceGroupName: 'vmicricEXT',
//     ServicePlanName: 'vmicricEXT'    
// };

// suite("Quick Test", function(): void {
//     test("Should Not Normalize Endpoint Keys", async function(): Promise<void> {
//         const regex = [
//             // Endpoint Name
//             /Endpoint/i,
//             /Endpoint_[\w]*/i,
//             // Endpoint AppId
//             /Endpoint_AppId/i,
//             /Endpoint_[\w]*_AppId/i,
//             // Endpoint AppPassword
//             /Endpoint_AppPassword/i,
//             /Endpoint_[\w]*_AppPassword/i,
//         ];
//         regex.map((r): void => {
//             const key = new RandExp(r).gen();
//             const newKey = normalizeEnvKeys(key);
//             assert.equal(newKey, key);
//         });
//     });
// });
