import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log, getToolsUpdateCommand } from '../src/utilities';
import { testNotify, deleteDownloadTemplates } from './testUtilities';
import { setVsCodeConfig } from '../src/utilities/variables/setVsCodeConfig';
import { getVsCodeConfig } from '../src/utilities/variables/getVsCodeConfig';

// Mocha.Setup doesn't seem to work consistently, so we'll force .env and appsettings.json to be watched for changes
watchEnvFiles();

// require('./loading');
// require('./emulator');
// require('./variables');
// require('./deploymentUnit');
// require('./deploymentE2E');  -- 5/20: ran out of app registrations

suite("Quick Test", function(): void {
    test("Should not prompt for variable if it exists", async function(): Promise<void> {
        const excluded = await getToolsUpdateCommand();
        console.log(excluded);
    });
});
