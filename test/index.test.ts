import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate } from '../src/utilities';
import { testNotify, deleteDownloadTemplates } from './testUtilities';

watchEnvFiles();

// require('./loading');
// require('./emulator');
// require('./variables');
require('./deploymentUnit');
require('./deploymentE2E');

// suite("Quick Test", function(): void {
//     test("Should create the deploymentTemplates folder if it doesn't exist", async function(): Promise<void> {
//         const root = getWorkspaceRoot();
//         const location = `${ root }\\deploymentTemplates`;
//         try {
//             await deleteDownloadTemplates();
//             await fsP.rmdir(location);
//         } catch { }
//         await getDeploymentTemplate(constants.deploymentTemplates["template-with-new-rg.json"]);
//         const folder = await fsP.readdir(location);
//         assert(folder.length > 0);
//     });
// });
