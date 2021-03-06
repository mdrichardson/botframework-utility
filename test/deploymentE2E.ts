import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { BotVariables } from '../src/interfaces';
import {  setBotVariables, getCreateAppRegistrationCommand, getCreateResourcesCommand, getPrepareDeployCommand, createCodeZip, getDeployCommand, getWorkspaceRoot, executeTerminalCommand, watchEnvFiles, createAzureResources } from '../src/utilities';
import { cleanup, deleteTerminalOutputFile, deleteBot, deletePrepareDeployFiles, testNotify, clearEnvVariables, disposeAllTerminals } from './testUtilities';
import { CommandOptions } from '../src/interfaces/CommandOptions';
import fs = require('fs');
const fsP = fs.promises;

const suffix = Math.floor(Math.random() * 1000);
const name = `vmicricExtTest${ suffix }`;

var testEnv: BotVariables = {
    BotName: name,
    CodeLanguage: constants.variables.sdkLanguages.Csharp,
    Location: 'westus',
    MicrosoftAppId: '',
    MicrosoftAppPassword: 'AtLeast16Characters____0',
    ResourceGroupName: name,
    ServicePlanName: name    
};

// Note: Each of these relies on the each previous test being successful
suite("Deployment - E2E", function(): void {
    suiteSetup(async (): Promise<void> => {
        await clearEnvVariables();
        await setBotVariables(testEnv);
        testNotify(`Resource Suffix: ${ suffix }`);
    });
    
    suiteTeardown(async (): Promise<void> => {
        await cleanup(testEnv.MicrosoftAppId, testEnv.ResourceGroupName);      
    });
    
    setup(async (): Promise<void> => {
        watchEnvFiles();
        await setBotVariables(testEnv);
        await deleteTerminalOutputFile();
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
        await disposeAllTerminals();
    });
    
    test("Should create a web app", async function(): Promise<void> {
        const timeout = 20 * 1000;
        this.timeout(timeout);

        const command = (await getCreateAppRegistrationCommand() as string);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.WebappCreate,
            commandTitle: 'Test - App Registration Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = (await executeTerminalCommand(command, options) as Partial<BotVariables>);
        assert.notEqual(result.MicrosoftAppId, undefined);
        if (result.MicrosoftAppId) { testEnv = { ...testEnv, ...result }; };
    });

    test("Should Create Resources - All New", async function(): Promise<void> {
        const timeout = 3 * 60 * 1000;
        this.timeout(timeout);

        testNotify('Creating resources...');
        const command = await getCreateResourcesCommand(true, true);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.CreateAzureResources,
            commandFailedRegex: constants.regex.forDispose.CreateAzureResourcesError,
            commandTitle: 'Test - Azure Resource Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });

    test("Should Create Resources - Existing ResourceGroup, New ServicePlan", async function(): Promise<void> {
        const timeout = 2 * 60 * 1000;
        this.timeout(timeout);

        testNotify('Creating resources...');
        await deleteBot(testEnv.BotName, testEnv.ResourceGroupName);

        const name = `${ testEnv.ServicePlanName }new`;
        await setBotVariables({ [constants.variables.botVariables.ServicePlanName]: name });

        const command = await getCreateResourcesCommand(false, true);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.CreateAzureResources,
            commandFailedRegex: constants.regex.forDispose.CreateAzureResourcesError,
            commandTitle: 'Test - Azure Resource Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });

    test("Should Create Resources - All Existing", async function(): Promise<void> {
        const timeout = 3 * 60 * 1000;
        this.timeout(timeout);

        await deleteBot(testEnv.BotName, testEnv.ResourceGroupName);

        // Give bot time to delete
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 10000));

        testNotify('Creating resources...');
        const name = `${ testEnv.BotName }new`;
        await setBotVariables({ BotName: name });

        const command = await getCreateResourcesCommand(false, true);
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.CreateAzureResources,
            commandFailedRegex: constants.regex.forDispose.CreateAzureResourcesError,
            commandTitle: 'Test - Azure Resource Creation',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });

    test("Generic CreateAzureResources command should not throw, but will error in console", async function(): Promise<void> {
        this.timeout(2 * 60 * 1000);

        try {
            await createAzureResources(false, false);
        } catch(err) {
            assert.fail(err);
        }
    });

    test("Should Prepare Deploy", async function(): Promise<void> {
        const timeout = 15 * 1000;
        this.timeout(timeout);

        testNotify('Preparing deployment...');
        await deletePrepareDeployFiles();

        const command = await getPrepareDeployCommand();
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.PrepareDeploy,
            commandFailedRegex: constants.regex.forDispose.PrepareDeployFailed,
            commandTitle: 'Test - Prepare Deployment',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);

        let file;
        if (testEnv.CodeLanguage == constants.variables.sdkLanguages.Csharp) {
            file = await vscode.workspace.findFiles('**/.deployment');
        } else {
            file = await vscode.workspace.findFiles('**/web.config');
        }
        assert(file.length > 0);
    });

    test("Should Deploy", async function(): Promise<void> {
        const timeout = 10 * 60 * 1000;
        this.timeout(timeout);

        testNotify('Zipping...');
        await createCodeZip();

        testNotify('Deploying...');
        const command = await getDeployCommand();
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.Deploy,
            commandFailedRegex: constants.regex.forDispose.DeployFailed,
            commandTitle: 'Test - Deployment',
            isTest: true,
            timeout: timeout - 500,
        };
        const result = await executeTerminalCommand(command, options);
        assert.equal(result, true);
    });    

    test("Should Clean Up After Itself", async function(): Promise<void> {
        // SuiteTeardown doesn't seem to be called, so we'll just manually clean up here
        await cleanup(testEnv.MicrosoftAppId, testEnv.ResourceGroupName);
        assert(true);
    });    
});