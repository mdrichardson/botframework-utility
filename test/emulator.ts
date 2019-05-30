/* eslint-disable @typescript-eslint/camelcase */
// Cspell:disable

import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { getEmulatorLaunchCommand, normalizeEnvKeys, setBotVariables, getLocalBotVariables, getEndpointKeyType, getEndpointObject, syncLocalBotVariablesToEnv, getEndpoints } from '../src/utilities/index';
import { clearEnvVariables, writeCodeFiles } from './testUtilities';
import sinon = require('sinon');
import RandExp = require('randexp');

const endpoint = 'http://test.com';
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

suite('Emulator', function(): void {
    test('Should Create Proper Emulator Start Command', function(): void {
        const url = getEmulatorLaunchCommand('http://localhost:3978/api/messages');
        assert.equal(url, `start "bfemulator://livechat.open?botUrl=http%3A%2F%2Flocalhost%3A3978%2Fapi%2Fmessages"`);
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

        assert.equal(endpointUnnamed.Endpoint, botVariables.Endpoint);
        assert.equal(endpointUnnamed.AppId, botVariables.Endpoint_AppId);
        assert.equal(endpointUnnamed.AppPassword, botVariables.Endpoint_AppPassword);
        assert.equal(endpointNamed.Endpoint, botVariables.Endpoint_Test);
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

        assert.equal(endpointUnnamed.Endpoint, botVariables.Endpoint);
        assert.equal(endpointUnnamed.AppId, botVariables.Endpoint_AppId);
        assert.equal(endpointUnnamed.AppPassword, botVariables.Endpoint_AppPassword);
        assert.equal(endpointNamed.Endpoint, botVariables.Endpoint_Test);
        assert.equal(endpointNamed.AppId, botVariables.Endpoint_Test_AppId);
        assert.equal(endpointNamed.AppPassword, botVariables.Endpoint_Test_AppPassword);
    });
    test("Should Prompt for Endpoint AppId and Pass if not exist", async function(): Promise<void> {
        const timeout = 3 * 1000;
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

        assert.equal(endpointUnnamed.Endpoint, endpoint);
        assert.equal(endpointUnnamed.AppId, appId1);
        assert.equal(endpointUnnamed.AppPassword, appPass1);
        assert.equal(endpointNamed.Endpoint, endpoint);
        assert.equal(endpointNamed.AppId, appId2);
        assert.equal(endpointNamed.AppPassword, appPass2);
    });
    test("Should Throw if No Endpoints are Specified", async function(): Promise<void> {
        await clearEnvVariables();

        try {
            await getEndpoints();
            assert.fail();
        } catch (err) { }
    });
});