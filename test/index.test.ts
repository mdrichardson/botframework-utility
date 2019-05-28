import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log, getToolsUpdateCommand, getCurrentAzCliVersion, getLatestAzCliVersion, deleteDirectory, createTempDir, getSparseCheckoutCommand, promptForSample, rootFolderIsEmpty, renameDirectory, getSample, createCodeZip, deleteCodeZip, setLocalBotVariables, syncLocalBotVariablesToEnv, getTerminalPath, joinTerminalCommands, handleTerminalData, regexToVariables } from '../src/utilities';
import { testNotify, deleteDownloadTemplates, makeNestedTestDir, deleteCodeFiles, writeCodeFiles, deleteTerminalOutputFile } from './testUtilities';
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

// require('./loading');
// require('./emulator');
require('./variables');
// require('./tools');
// require('./samples');
// require('./deploymentUnit');
// require('./deploymentE2E');  -- 5/20: ran out of app registrations

// suite("Quick Test", function(): void {
//     test("Should display input prompt and prompt for variable if it doesn't exist", async function(): Promise<void> {
//         await setBotVariables({ [constants.envVars.BotName]: undefined });
//         const promptStub = sinon.stub(vscode.window, 'showInputBox');
//         promptStub.resolves('testBotName');
//         const result = await promptForVariableIfNotExist(constants.envVars.BotName);
//         assert.equal(result, 'testBotName');
//     });
// });
