import * as assert from 'assert';
import * as constants from '../constants';
import * as vscode from 'vscode';
import { deleteTerminalOutputFile, newEnvFile, testTerminalCommand, cleanup, deleteResourceGroupDeployment, deleteBot } from './testUtilities';
import { getCreateAppRegistrationCommand, getCreateResourcesCommand } from '../commands';
import { BotVariables } from '../interfaces';
import { setBotVariable, syncLocalBotVariablesToEnv, setEnvBotVariables } from '../utilities';

const suffix = Math.floor(Math.random() * 1000);
const name = `vmicricEXTtest${ suffix }`;

var testEnvironmentObject: BotVariables = {
    BotName: name,
    CodeLanguage: constants.sdkLanguages.Csharp,
    Location: 'westus',
    MicrosoftAppId: '37765811-fc7b-4b94-9201-88cf09a2983c',
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

// Note: Each of these relies on the each previous test being successful
suite("Deployment", function(): void {
    setup(async (): Promise<void> => {
        // await deleteTerminalOutputFile();
        await setBotVariable(testEnvironmentObject);
        await setEnvBotVariables(testEnvironmentObject);
    });
    test("Should create a web app", async function(): Promise<void> {
        this.timeout(20 * 1000);

        const command = (await getCreateAppRegistrationCommand() as string);
        const result = (await testTerminalCommand(command, constants.regexForDispose.WebappCreate) as Partial<BotVariables>);
        assert(result);
        if (result) { testEnvironmentObject = { ...testEnvironmentObject, ...result }; };
    });

    test("Should CreateResourcesNewResourceGroup", async function(): Promise<void> {
        this.timeout(2 * 60 * 1000);

        const command = await getCreateResourcesCommand(true, true);
        const result = (await testTerminalCommand(command, constants.regexForDispose.CreateAzureResources) as Partial<BotVariables>);
        assert(result);
    });

    test("Should CreateResourcesExistingResourceGroupNewServicePlan", async function(): Promise<void> {
        this.timeout(2 * 60 * 1000);

        await deleteResourceGroupDeployment(testEnvironmentObject.BotName);

        testEnvironmentObject.ServicePlanName = `${ testEnvironmentObject.ServicePlanName }_new`;
        await setBotVariable(testEnvironmentObject);

        const command = await getCreateResourcesCommand(false, true);
        const result = (await testTerminalCommand(command, constants.regexForDispose.CreateAzureResources) as Partial<BotVariables>);
        assert(result);
    });

    test("Should CreateResourcesExistingResourceGroupExistingServicePlan", async function(): Promise<void> {
        this.timeout(2 * 60 * 1000);

        await deleteBot(testEnvironmentObject.MicrosoftAppId);

        const command = await getCreateResourcesCommand(false, true);
        const result = (await testTerminalCommand(command, constants.regexForDispose.CreateAzureResources) as Partial<BotVariables>);
        assert(result);
        cleanup(testEnvironmentObject.BotName, testEnvironmentObject.ResourceGroupName);
    });

});