import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log, getToolsUpdateCommand, getCurrentAzCliVersion, getLatestAzCliVersion } from '../src/utilities';
import { testNotify, deleteDownloadTemplates } from './testUtilities';
import { setVsCodeConfig } from '../src/utilities/variables/setVsCodeConfig';
import { getVsCodeConfig } from '../src/utilities/variables/getVsCodeConfig';
import { CommandOptions } from '../src/interfaces/CommandOptions';
import Axios, { AxiosResponse } from 'axios';
import * as semver from 'semver';

// Mocha.Setup doesn't seem to work consistently, so we'll force .env and appsettings.json to be watched for changes
watchEnvFiles();

// require('./loading');
// require('./emulator');
// require('./variables');
// require('./tools');
// require('./deploymentUnit');
// require('./deploymentE2E');  -- 5/20: ran out of app registrations

suite("Quick Test", function(): void {
    test("Should normalize cli tools", async function(): Promise<void> {
        this.timeout(30000);
        const currentVersion = await getCurrentAzCliVersion();
        const latestVersion = await getLatestAzCliVersion();

        if (semver.gte(latestVersion, currentVersion)) {
            log(`Your version of AZ CLI is ${ currentVersion }, but ${ latestVersion } is available.`);
            vscode.window.showInformationMessage(`You must download AZ CLI updates manually.`);
            vscode.env.openExternal(vscode.Uri.parse(constants.websites.azCliDownload));
        }
    });
});
