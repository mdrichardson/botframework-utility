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
//     test("Should Get and Set VSCode Configs", async function(): Promise<void> {
//         this.timeout(50000);
//         await setVsCodeConfig(constants.vsCodeConfigNames.customTerminalForAzCommands, 'test');
//         assert.equal(await getVsCodeConfig(constants.vsCodeConfigNames.customTerminalForAzCommands), 'test');
//         await setVsCodeConfig(constants.vsCodeConfigNames.customTerminalForAzCommands, undefined);
//     });
// });
