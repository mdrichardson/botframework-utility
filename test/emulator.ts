/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/camelcase */
// Cspell:disable

import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { getEmulatorLaunchCommand, normalizeEnvKeys, setBotVariables, getLocalBotVariables, getEndpointKeyType, getEndpointObject, syncLocalBotVariablesToEnv, getEndpoints, getEndpointFromQuickPick, modifyEndpointNameIfNecessary, promptForNewEndpoint, getSingleEndpoint } from '../src/utilities/index';
import { clearEnvVariables, writeCodeFiles } from './testUtilities';
import sinon = require('sinon');
import RandExp = require('randexp');
import { Endpoint } from '../src/interfaces';

const endpoint = 'http://xyz.azurewebsites.net/api/messages';
const appId = new RandExp(constants.regex.forValidations.GUID).gen();
const appPass = new RandExp(constants.regex.forValidations.MicrosoftAppPassword).gen();

const botVariables = {
    Endpoint: endpoint,
    Endpoint_AppId: appId,
    Endpoint_AppPassword: appPass,
    Endpoint_Test: endpoint,
    Endpoint_Test_AppId: appId,
    Endpoint_Test_AppPassword: appPass,
};

const testEndpoint: Endpoint = {
    AppId: appId,
    AppPassword: appPass,
    Host: endpoint,
    Name: 'Endpoint_Test',
};

const testEndpoints = {
    Endpoint_Test: testEndpoint.Host,
    Endpoint_Test_AppId: testEndpoint.AppId,
    Endpoint_Test_AppPassword: testEndpoint.AppPassword,
    Endpoint_Test1: testEndpoint.Host,
    Endpoint_Test1_AppId: testEndpoint.AppId,
    Endpoint_Test1_AppPassword: testEndpoint.AppPassword,
    Endpoint_Test2: testEndpoint.Host,
    Endpoint_Test2_AppId: testEndpoint.AppId,
    Endpoint_Test2_AppPassword: testEndpoint.AppPassword,
};

suite('Emulator', function(): void {
    teardown((): void => {
        sinon.restore();
    });
    test('Should Create Proper Emulator Start Command', function(): void {
        const urlLocal = getEmulatorLaunchCommand('http://localhost:3978/api/messages');
        const urlProduction = getEmulatorLaunchCommand(endpoint, {
            appId: appId,
            appPassword: appPass,
        });

        assert.equal(urlLocal, `start "bfemulator://livechat.open?botUrl=${ encodeURIComponent('http://localhost:3978/api/messages') }"`);
        assert.equal(urlProduction, `start "bfemulator://livechat.open?botUrl=${ encodeURIComponent(endpoint) }&msaAppId=${ appId }&msaPassword=${ appPass }"`);
    });
    test("Should Not Normalize Endpoint Keys", async function(): Promise<void> {
        const regex = [
            // Endpoint Name
            /Endpoint/i,
            /Endpoint_[\w]*/i,
            // Endpoint AppId
            /Endpoint_AppId/i,
            /Endpoint_[\w]*_AppId/i,
            // Endpoint AppPassword
            /Endpoint_AppPassword/i,
            /Endpoint_[\w]*_AppPassword/i,
        ];
        regex.map((r): void => {
            const key = new RandExp(r).gen();
            const newKey = normalizeEnvKeys(key);
            assert.equal(newKey, key);
        });
    });
    test("Should Get Endpoint Variables - Node", async function(): Promise<void> {
        await clearEnvVariables();
        await writeCodeFiles(constants.variables.sdkLanguages.Node);
        await setBotVariables(botVariables);

        const localVariables = await getLocalBotVariables();

        assert.equal(localVariables['Endpoint'], endpoint);
        assert.equal(localVariables['Endpoint_AppId'], appId);
        assert.equal(localVariables['Endpoint_AppPassword'], appPass);
        assert.equal(localVariables['Endpoint_Test'], endpoint);
        assert.equal(localVariables['Endpoint_Test_AppId'], appId);
        assert.equal(localVariables['Endpoint_Test_AppPassword'], appPass);
    });
    test("Should Get Endpoint Variables - C#", async function(): Promise<void> {
        await clearEnvVariables();
        await writeCodeFiles(constants.variables.sdkLanguages.Csharp);
        await setBotVariables(botVariables);
        const localVariables = await getLocalBotVariables();
        assert.equal(localVariables['Endpoint'], endpoint);
        assert.equal(localVariables['Endpoint_AppId'], appId);
        assert.equal(localVariables['Endpoint_AppPassword'], appPass);
        assert.equal(localVariables['Endpoint_Test'], endpoint);
        assert.equal(localVariables['Endpoint_Test_AppId'], appId);
        assert.equal(localVariables['Endpoint_Test_AppPassword'], appPass);
    });
    test("Should Return the Appropriate Endpoint Key Type", async function(): Promise<void> {
        const name1 = new RandExp(/Endpoint/i).gen();
        const name2 = new RandExp(/Endpoint_[\w]*/i).gen();
        const appId1 = new RandExp(/Endpoint_AppId/i).gen();
        const appId2 = new RandExp(/Endpoint_[\w]*_AppId/i).gen();
        const appPass1 = new RandExp(/Endpoint_AppPassword/i).gen();
        const appPass2 = new RandExp(/Endpoint_[\w]*_AppPassword/i).gen();
        const botName = constants.variables.botVariables.BotName;

        assert.equal(getEndpointKeyType(name1), constants.regex.endpointSuffixes.Name);
        assert.equal(getEndpointKeyType(name2), constants.regex.endpointSuffixes.Name);
        assert.equal(getEndpointKeyType(appId1), constants.regex.endpointSuffixes.AppId);
        assert.equal(getEndpointKeyType(appId2), constants.regex.endpointSuffixes.AppId);
        assert.equal(getEndpointKeyType(appPass1), constants.regex.endpointSuffixes.AppPassword);
        assert.equal(getEndpointKeyType(appPass2), constants.regex.endpointSuffixes.AppPassword);
        assert.equal(getEndpointKeyType(botName), false);
    });
    test("Should Get an Appropriate Endpoint Object", async function(): Promise<void> {
        const endpointUnnamed = await getEndpointObject('Endpoint', botVariables);
        const endpointNamed = await getEndpointObject('Endpoint_Test', botVariables);

        assert.equal(endpointUnnamed.Host, botVariables.Endpoint);
        assert.equal(endpointUnnamed.AppId, botVariables.Endpoint_AppId);
        assert.equal(endpointUnnamed.AppPassword, botVariables.Endpoint_AppPassword);
        assert.equal(endpointNamed.Host, botVariables.Endpoint_Test);
        assert.equal(endpointNamed.AppId, botVariables.Endpoint_Test_AppId);
        assert.equal(endpointNamed.AppPassword, botVariables.Endpoint_Test_AppPassword);
    });
    test("Should Get an Array of Endpoints", async function(): Promise<void> {
        await clearEnvVariables();
        await writeCodeFiles();
        await setBotVariables(botVariables);
        await syncLocalBotVariablesToEnv();

        const endpoints = await getEndpoints();

        const endpointUnnamed = endpoints[0];
        const endpointNamed = endpoints[1];

        assert.equal(endpointUnnamed.Host, botVariables.Endpoint);
        assert.equal(endpointUnnamed.AppId, botVariables.Endpoint_AppId);
        assert.equal(endpointUnnamed.AppPassword, botVariables.Endpoint_AppPassword);
        assert.equal(endpointNamed.Host, botVariables.Endpoint_Test);
        assert.equal(endpointNamed.AppId, botVariables.Endpoint_Test_AppId);
        assert.equal(endpointNamed.AppPassword, botVariables.Endpoint_Test_AppPassword);
    });
    test("Should Prompt for Endpoint AppId and Pass if not exist", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const endpoint = 'http://test.com';
        const appId1 = new RandExp(constants.regex.forValidations.GUID).gen();
        const appId2 = new RandExp(constants.regex.forValidations.GUID).gen();
        const appPass1 = new RandExp(constants.regex.forValidations.MicrosoftAppPassword).gen();
        const appPass2 = new RandExp(constants.regex.forValidations.MicrosoftAppPassword).gen();
        const missingVars = {
            Endpoint: endpoint,
            Endpoint_Test: endpoint
        };

        await clearEnvVariables();
        // Ensure files won't be locked
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
        await writeCodeFiles();
        await setBotVariables(missingVars);
        await syncLocalBotVariablesToEnv();

        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.onCall(0).resolves(appId1);
        promptStub.onCall(1).resolves(appPass1);
        promptStub.onCall(2).resolves(appId2);
        promptStub.onCall(3).resolves(appPass2);

        const endpoints = await getEndpoints();

        const endpointUnnamed = endpoints[0];
        const endpointNamed = endpoints[1];

        assert.equal(endpointUnnamed.Host, endpoint);
        assert.equal(endpointUnnamed.AppId, appId1);
        assert.equal(endpointUnnamed.AppPassword, appPass1);
        assert.equal(endpointNamed.Host, endpoint);
        assert.equal(endpointNamed.AppId, appId2);
        assert.equal(endpointNamed.AppPassword, appPass2);
    });
    test("Should Prompt for New Endpoint if No Endpoints are Specified", async function(): Promise<void> {
        await clearEnvVariables();

        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.resolves(undefined);

        const endpoints = await getEndpoints();
        assert.equal(endpoints[0], undefined);
    });
    test("Should Appropriately Modify Endpoint Names", async function(): Promise<void> {
        const timeout = 20 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        await clearEnvVariables();

        await setBotVariables(testEndpoints);

        const noChange = await modifyEndpointNameIfNecessary('Endpoint_XYZ');
        const reformatted = await modifyEndpointNameIfNecessary('ABC');
        const numbered = await modifyEndpointNameIfNecessary(testEndpoint.Name);

        assert.equal(noChange, 'Endpoint_XYZ');
        assert.equal(reformatted, 'Endpoint_ABC');
        assert.equal(numbered, 'Endpoint_Test3');       
    });
    test("Should Return no undefined if User Prompted for Name and Dismissed", async function(): Promise<void> {
        await clearEnvVariables();

        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.resolves(undefined);

        const endpoint = await promptForNewEndpoint();
        assert.equal(endpoint, undefined);      
    });
    test("Should Return an Endpoint Object after Prompting for an Endpoint - No AppId/Pass/Host - Correct Format", async function(): Promise<void> {
        await clearEnvVariables();

        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.onCall(0).resolves(testEndpoint.Name);
        promptStub.onCall(1).resolves(testEndpoint.AppId);
        promptStub.onCall(2).resolves(testEndpoint.AppPassword);
        promptStub.onCall(3).resolves(testEndpoint.Host);

        const endpoint = (await promptForNewEndpoint() as Endpoint);

        assert.equal(endpoint.AppId, testEndpoint.AppId);
        assert.equal(endpoint.AppPassword, testEndpoint.AppPassword);
        assert.equal(endpoint.Host, testEndpoint.Host);
        assert.equal(endpoint.Name, testEndpoint.Name);
    });
    test("Should Return an Endpoint Object after Prompting for an Endpoint - No AppId/Pass/Host - Incorrect Format", async function(): Promise<void> {
        await clearEnvVariables();

        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.onCall(0).resolves('Test');
        promptStub.onCall(1).resolves(testEndpoint.AppId);
        promptStub.onCall(2).resolves(testEndpoint.AppPassword);
        promptStub.onCall(3).resolves(testEndpoint.Host);

        const endpoint = (await promptForNewEndpoint() as Endpoint);

        assert.equal(endpoint.AppId, testEndpoint.AppId);
        assert.equal(endpoint.AppPassword, testEndpoint.AppPassword);
        assert.equal(endpoint.Host, testEndpoint.Host);
        assert.equal(endpoint.Name, testEndpoint.Name);
    });
    test("Should Return an Endpoint Object after Prompting for an Endpoint - Existing AppId/Pass/Host", async function(): Promise<void> {
        await clearEnvVariables();

        await setBotVariables({
            Endpoint_Test_AppId: testEndpoint.AppId,
            Endpoint_Test_AppPassword: testEndpoint.AppPassword,
        });

        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.onCall(0).resolves(testEndpoint.Name);
        promptStub.onCall(1).resolves(testEndpoint.Host);

        const endpoint = (await promptForNewEndpoint() as Endpoint);

        assert.equal(endpoint.AppId, testEndpoint.AppId);
        assert.equal(endpoint.AppPassword, testEndpoint.AppPassword);
        assert.equal(endpoint.Host, testEndpoint.Host);
        assert.equal(endpoint.Name, testEndpoint.Name);
    });
    test("Should Return an Endpoint Object after Prompting for an Endpoint - Using Default AppId/Pass if None Entered", async function(): Promise<void> {
        await clearEnvVariables();

        await setBotVariables({
            MicrosoftAppId: testEndpoint.AppId,
            MicrosoftAppPassword: testEndpoint.AppPassword,
        });

        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        // Extra prompts account for prompt retries
        promptStub.onCall(0).resolves(testEndpoint.Name);
        promptStub.onCall(1).resolves(undefined);
        promptStub.onCall(2).resolves(undefined);
        promptStub.onCall(3).resolves(undefined);
        promptStub.onCall(4).resolves(undefined);
        promptStub.onCall(5).resolves(testEndpoint.Host);

        const endpoint = (await promptForNewEndpoint() as Endpoint);

        assert.equal(endpoint.AppId, testEndpoint.AppId);
        assert.equal(endpoint.AppPassword, testEndpoint.AppPassword);
        assert.equal(endpoint.Host, testEndpoint.Host);
        assert.equal(endpoint.Name, testEndpoint.Name);
    });
    test("Should Return a Single Endpoint if Only 1 Exists", async function(): Promise<void> {
        await clearEnvVariables();

        await setBotVariables({
            Endpoint_Test: testEndpoint.Host,
            Endpoint_Test_AppId: testEndpoint.AppId,
            Endpoint_Test_AppPassword: testEndpoint.AppPassword,
        });

        const endpoint = (await getSingleEndpoint() as Endpoint);
        assert.equal(endpoint.AppId, testEndpoint.AppId);
        assert.equal(endpoint.AppPassword, testEndpoint.AppPassword);
        assert.equal(endpoint.Host, testEndpoint.Host);
        assert.equal(endpoint.Name, testEndpoint.Name);       
    });
    test("Should Return no Endpoints if Multiple Exist and User Didn't Choose One", async function(): Promise<void> {
        await clearEnvVariables();

        const promptStub = sinon.stub(vscode.window, 'showQuickPick');
        promptStub.resolves(undefined);

        await setBotVariables(testEndpoints);

        const endpoint = await getEndpointFromQuickPick(await getEndpoints());
        assert.equal(endpoint, undefined);
    });
    test("Should Return Appropriate Endpoint from QuickPick", async function(): Promise<void> {
        await clearEnvVariables();

        const promptStub = sinon.stub(vscode.window, 'showQuickPick');
        promptStub.resolves(('Endpoint_Test2' as unknown as vscode.QuickPickItem));

        await setBotVariables(testEndpoints);

        const endpoint = (await getEndpointFromQuickPick(await getEndpoints()) as Endpoint);
        assert.equal(endpoint.AppId, testEndpoints.Endpoint_Test2_AppId);
        assert.equal(endpoint.AppPassword, testEndpoints.Endpoint_Test2_AppPassword);
        assert.equal(endpoint.Host, testEndpoints.Endpoint_Test2);
        assert.equal(endpoint.Name, 'Endpoint_Test2');  
    });
    test("Should Return Appropriate Endpoint from QuickPick", async function(): Promise<void> {
        await clearEnvVariables();

        const promptStub = sinon.stub(vscode.window, 'showQuickPick');
        promptStub.resolves(('Endpoint_Test2' as unknown as vscode.QuickPickItem));

        await setBotVariables(testEndpoints);

        const endpoint = (await getEndpointFromQuickPick(await getEndpoints()) as Endpoint);
        assert.equal(endpoint.AppId, testEndpoints.Endpoint_Test2_AppId);
        assert.equal(endpoint.AppPassword, testEndpoints.Endpoint_Test2_AppPassword);
        assert.equal(endpoint.Host, testEndpoints.Endpoint_Test2);
        assert.equal(endpoint.Name, 'Endpoint_Test2');  
    });
});