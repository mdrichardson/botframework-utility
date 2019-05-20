import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log } from '../src/utilities';
import { testNotify, deleteDownloadTemplates } from './testUtilities';
import { setVsCodeConfig } from '../src/utilities/variables/setVsCodeConfig';
import { getVsCodeConfig } from '../src/utilities/variables/getVsCodeConfig';

// Mocha.Setup doesn't seem to work consistently, so we'll force .env and appsettings.json to be watched for changes
watchEnvFiles();

require('./loading');
require('./emulator');
require('./variables');
require('./deploymentUnit');
// require('./deploymentE2E');  -- 5/20: ran out of app registrations

// suite("Quick Test", function(): void {
//     test("Should not prompt for variable if it exists", async function(): Promise<void> {
//         const testName = 'testBotNameTEST';
//         await setBotVariables({ [constants.envVars.BotName]: testName });
//         try {
//             await promptForVariableIfNotExist('BotName');
//         } catch (err) {
//             assert.fail();
//         }
//     });
// });
