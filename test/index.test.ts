import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log } from '../src/utilities';
import { testNotify, deleteDownloadTemplates } from './testUtilities';

// Mocha.Setup doesn't seem to work consistently, so we'll force .env and appsettings.json to be watched for changes
watchEnvFiles();

require('./loading');
require('./emulator');
require('./variables');
require('./deploymentUnit');
require('./deploymentE2E');

// suite("Quick Test", function(): void {
//     test("Should Execute Command from User Terminal Path Without Throwing", async function(): Promise<void> {
//         this.timeout(50000);
//         await vscode.workspace.getConfiguration().update('botframework-utility.customTerminalForAzCommands', 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe', vscode.ConfigurationTarget.Global);
//         try {
//             executeTerminalCommand('az test');
//         } catch { assert.fail(); };
//     });
//     test("Should Execute Command from OS Default Terminal Path Without Throwing", async function(): Promise<void> {
//         this.timeout(50000);
//         try {
//             // Note: Use this format when updating extension configs
//             await vscode.workspace.getConfiguration().update('botframework-utility.customTerminalForAzCommands', undefined, vscode.ConfigurationTarget.Global);
//             executeTerminalCommand('az test');
//         } catch (err) {
//             assert.fail(err);
//         }
//     });
// });
