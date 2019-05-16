import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables } from '../src/utilities';
import { testNotify } from './testUtilities';


require('./loading');
require('./emulator');
// require('./variables');
// require('./deploymentUnit');
// require('./deploymentE2E');

// suite("Quick Test", function(): void {
//     test("Should not throw when re-prompting", async function(): Promise<void> {
//         this.timeout(2000);
//         await setBotVariables({ [constants.envVars.BotName]: undefined });
//         try {
//             const test = new vscode.CancellationTokenSource();
//             promptForVariableIfNotExist('BotName', undefined, constants.regexForValidations.WordsOnly, test.token);
//             await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
//             test.cancel();
//         } catch(err) {
//             assert.fail(err);
//         }
//     });
// });
