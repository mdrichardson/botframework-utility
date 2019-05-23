import * as constants from '../src/constants';
import * as vscode from 'vscode';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables, watchEnvFiles, getDeploymentTemplate, executeTerminalCommand, getLocalBotVariables, log, getToolsUpdateCommand, getCurrentAzCliVersion, getLatestAzCliVersion, deleteDirectory, createTempDir, getSparseCheckoutCommand, promptForSample, rootFolderIsEmpty, renameDirectory, getSample, createCodeZip, deleteCodeZip } from '../src/utilities';
import { testNotify, deleteDownloadTemplates, makeNestedTestDir } from './testUtilities';
import { setVsCodeConfig } from '../src/utilities/variables/setVsCodeConfig';
import { getVsCodeConfig } from '../src/utilities/variables/getVsCodeConfig';
import { CommandOptions } from '../src/interfaces/CommandOptions';
import Axios, { AxiosResponse } from 'axios';
import sinon = require('sinon');
// Mocha.Setup doesn't seem to work consistently, so we'll force .env and appsettings.json to be watched for changes
watchEnvFiles();

// require('./loading');
// require('./emulator');
// require('./variables');
// require('./tools');
// require('./samples');
// require('./deploymentUnit');
// require('./deploymentE2E');  -- 5/20: ran out of app registrations

suite("Quick Test", function(): void {
    test("Should delete zip file", async function(): Promise<void> {
        const timeout = 10 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        await deleteCodeZip();
        // Give time for it to delete since it doesn't seem to do so immediately
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 3000));
        const file = await vscode.workspace.findFiles(`${ constants.zipFileName }`);
        assert(!file.length);
    });
    test("Should delete zip file", async function(): Promise<void> {
        const timeout = 10 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        await deleteCodeZip();
        // Give time for it to delete since it doesn't seem to do so immediately
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 3000));
        const file = await vscode.workspace.findFiles(`${ constants.zipFileName }`);
        assert(!file.length);
    });
    test("Should delete zip file", async function(): Promise<void> {
        const timeout = 10 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        await deleteCodeZip();
        // Give time for it to delete since it doesn't seem to do so immediately
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 3000));
        const file = await vscode.workspace.findFiles(`${ constants.zipFileName }`);
        assert(!file.length);
    });
});
