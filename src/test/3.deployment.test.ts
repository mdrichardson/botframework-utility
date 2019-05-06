import * as assert from 'assert';
import * as constants from '../constants';
import * as vscode from 'vscode';
import { deleteTerminalOutputFile, newEnvFile, testTerminalCommand, deleteResourceGroup } from './testUtilities';
import { getCreateAppRegistrationCommand, getCreateResourcesCommand } from '../commands';
import { BotVariables } from '../interfaces';
import { setBotVariable, syncLocalBotVariablesToEnv, setEnvBotVariables } from '../utilities';

const suffix = Math.floor(Math.random() * 1000);
const name = `vmicricEXTtest${ suffix }`;

var testEnvironmentObject: BotVariables = {
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
        await deleteResourceGroup(testEnvironmentObject.ResourceGroupName);
    });

});