import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { BotVariables } from '../src/interfaces';
import { syncLocalBotVariablesToEnv, setBotVariables, setEnvBotVariables, getCreateAppRegistrationCommand, getCreateResourcesCommand, getPrepareDeployCommand, createUpdateZip, getDeployCommand, getWorkspaceRoot, executeTerminalCommand } from '../src/utilities';
import { cleanup, deleteTerminalOutputFile, deleteResourceGroupDeployment, deleteBot, deletePrepareDeployFiles, testNotify } from './testUtilities';
import fs = require('fs');
import { CommandOptions } from '../src/interfaces/CommandOptions';
const fsP = fs.promises;

const suffix = Math.floor(Math.random() * 1000);
const name = `vmicricExtTest${ suffix }`;

var testEnv: BotVariables = {
    BotName: name,
    CodeLanguage: constants.sdkLanguages.Csharp,
    Location: 'westus',
    MicrosoftAppId: '',
    MicrosoftAppPassword: 'AtLeast16Characters____0',
    ResourceGroupName: name,
    ServicePlanName: name    
};

suiteSetup(async (): Promise<void> => {
    // Watch .env and appsettings.json for changes
    const envWatcher = vscode.workspace.createFileSystemWatcher('**/.env', true, false, true);
    envWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
    const appsettingsJsonWatcher = vscode.workspace.createFileSystemWatcher('**/appsettings.json', true, false, true);
    appsettingsJsonWatcher.onDidChange(async (): Promise<void> => {
        await syncLocalBotVariablesToEnv();
    });
});

suiteTeardown(async (): Promise<void> => {
    await cleanup(testEnv.MicrosoftAppId, testEnv.ResourceGroupName);
});

// Note: Each of these relies on the each previous test being successful
suite("Deployment - E2E", function(): void {
    setup(async (): Promise<void> => {
        await deleteTerminalOutputFile();
        await setBotVariables(testEnv);
        await setEnvBotVariables(testEnv);
    });

    teardown(async function(): Promise<void> {
        if (this.currentTest.state === 'failed') {
            const root = getWorkspaceRoot();
            const saveLocation = `${ root }\\${ this.currentTest.title }.txt`;
            try {
                await fsP.copyFile(`${ root }\\${ constants.testing.TerminalOutput }`, saveLocation);
                testNotify(`Saved terminal error to: ${ saveLocation }`);
            } catch (err) { }
        }
    });
    
    test("Should create a web app", async function(): Promise<void> {
        const timeout = 20 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const command = (await getCreateAppRegistrationCommand() as string);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.WebappCreate,
            commandTitle: 'Test - App Registration Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = (await executeTerminalCommand(command, options) as Partial<BotVariables>);
        assert.notEqual(result.MicrosoftAppId, undefined);
        if (result.MicrosoftAppId) { testEnv = { ...testEnv, ...result }; };
    });

    test("Should CreateResourcesNewResourceGroup", async function(): Promise<void> {
        const timeout = 2 * 60 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        testNotify('Creating resources...');
        const command = await getCreateResourcesCommand(true, true);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.CreateAzureResources,
            commandTitle: 'Test - Azure Resource Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });

    test("Should CreateResourcesExistingResourceGroupNewServicePlan", async function(): Promise<void> {
        const timeout = 2 * 60 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        testNotify('Creating resources...');
        await deleteResourceGroupDeployment(testEnv.BotName);

        testEnv.ServicePlanName = `${ testEnv.ServicePlanName }_new`;
        await setBotVariables(testEnv);

        const command = await getCreateResourcesCommand(false, true);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.CreateAzureResources,
            commandTitle: 'Test - Azure Resource Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });

    test("Should CreateResourcesExistingResourceGroupExistingServicePlan", async function(): Promise<void> {
        const timeout = 2 * 60 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        testNotify('Creating resources...');
        await deleteBot(testEnv.MicrosoftAppId);

        const command = await getCreateResourcesCommand(false, true);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.CreateAzureResources,
            commandTitle: 'Test - Azure Resource Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });

    test("Should Prepare Deploy", async function(): Promise<void> {
        const timeout = 15 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        testNotify('Preparing deployment...');
        await deletePrepareDeployFiles();

        const command = await getPrepareDeployCommand();
        const options: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.PrepareDeploy,
            commandFailedRegex: constants.regexForDispose.PrepareDeployFailed,
            commandTitle: 'Test - Prepare Deployment',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);

        let file;
        if (testEnv.CodeLanguage == constants.sdkLanguages.Csharp) {
            file = await vscode.workspace.findFiles('**/.deployment');
        } else {
            file = await vscode.workspace.findFiles('**/web.config');
        }
        assert(file.length > 0);
    });

    test("Should Deploy", async function(): Promise<void> {
        const timeout = 10 * 60 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        testNotify('Zipping...');
        await createUpdateZip();

        testNotify('Deploying...');
        const command = await getDeployCommand();
        const options: CommandOptions = {
            commandCompleteRegex: constants.regexForDispose.Deploy,
            commandTitle: 'Test - Deployment',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });
});