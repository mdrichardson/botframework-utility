import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { BotVariables } from '../src/interfaces';
import { syncLocalBotVariablesToEnv, setBotVariables, setEnvBotVariables, getCreateAppRegistrationCommand, getCreateResourcesCommand, getPrepareDeployCommand, createUpdateZip, getDeployCommand } from '../src/utilities';
import { cleanup, deleteTerminalOutputFile, testTerminalCommand, deleteResourceGroupDeployment, deleteBot, deletePrepareDeployFiles } from './testUtilities';

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
    test("Should create a web app", async function(): Promise<void> {
        this.timeout(20 * 1000);

        const command = (await getCreateAppRegistrationCommand() as string);
        const result = (await testTerminalCommand(command, constants.regexForDispose.WebappCreate) as Partial<BotVariables>);
        assert(result);
        if (result) { testEnv = { ...testEnv, ...result }; };
    });

    test("Should CreateResourcesNewResourceGroup", async function(): Promise<void> {
        this.timeout(2 * 60 * 1000);

        const command = await getCreateResourcesCommand(true, true);
        const result = await testTerminalCommand(command, constants.regexForDispose.CreateAzureResources);
        assert(result);
    });

    test("Should CreateResourcesExistingResourceGroupNewServicePlan", async function(): Promise<void> {
        this.timeout(1.5 * 60 * 1000);

        await deleteResourceGroupDeployment(testEnv.BotName);

        testEnv.ServicePlanName = `${ testEnv.ServicePlanName }_new`;
        await setBotVariables(testEnv);

        const command = await getCreateResourcesCommand(false, true);
        const result = await testTerminalCommand(command, constants.regexForDispose.CreateAzureResources);
        assert(result);
    });

    test("Should CreateResourcesExistingResourceGroupExistingServicePlan", async function(): Promise<void> {
        this.timeout(1.5 * 60 * 1000);

        await deleteBot(testEnv.MicrosoftAppId);

        const command = await getCreateResourcesCommand(false, true);
        const result = await testTerminalCommand(command, constants.regexForDispose.CreateAzureResources);
        assert(result);
    });

    test("Should Prepare Deploy", async function(): Promise<void> {
        this.timeout(15 * 1000);

        await deletePrepareDeployFiles();

        const command = await getPrepareDeployCommand();
        const result = await testTerminalCommand(command, undefined, constants.regexForDispose.PrepareDeploy, 5000);
        assert(result);

        let file;
        if (testEnv.CodeLanguage == constants.sdkLanguages.Csharp) {
            file = await vscode.workspace.findFiles('**/.deployment');
        } else {
            file = await vscode.workspace.findFiles('**/web.config');
        }
        assert(file.length > 0);
    });

    test("Should Deploy", async function(): Promise<void> {
        this.timeout(10 * 60 * 1000);

        await createUpdateZip();

        const command = await getDeployCommand();
        const result = await testTerminalCommand(command, constants.regexForDispose.Deploy);
        assert(result);
    });
});