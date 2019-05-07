import * as assert from 'assert';
import * as constants from '../constants';
import { getLocalBotVariables, getWorkspaceRoot, getEnvBotVariables, setBotVariable, normalizeEnvKeys, getLanguage, promptForVariableIfNotExist, inputIsValid, arrayToRegex } from '../utilities';
import { deleteEnvFiles, deleteCodeFiles } from './testUtilities';
import fs = require('fs');
const fsP = fs.promises;
import RandExp = require('randexp');

suite("Variables", function(): void {
    test("Should Load Variables from Appsettings.json", async function(): Promise<void> {
        await deleteEnvFiles();
        const root = getWorkspaceRoot();
        const data = JSON.stringify({ testVar: 'test' });
        await fsP.writeFile(`${ root }\\appsettings.json`, data);
        const result = await getLocalBotVariables();
        assert.equal(result['testVar'], 'test');
    });
    test("Should Load Variables from .env", async function(): Promise<void> {
        await deleteEnvFiles();
        const root = getWorkspaceRoot();
        const data = 'testVar="test"';
        await fsP.writeFile(`${ root }\\.env`, data);
        const result = await getLocalBotVariables();
        assert.equal(result['testVar'], 'test');
    });
    test("Should Load Variables from process.env", async function(): Promise<void> {
        process.env.BOTFRAMEWORK_UTILITY = JSON.stringify({ testVar: 'test'});
        const result = await getEnvBotVariables();
        assert.equal(result['testVar'], 'test');
    });
    test("Should set variables locally and to process.env", async function(): Promise<void> {
        const testName = 'testBotNameTEST';
        await setBotVariable({ BotName: testName });

        const envResult = await getEnvBotVariables();
        assert.equal(envResult['BotName'], testName);

        const localResult = await getLocalBotVariables();
        assert.equal(localResult['BotName'], testName);
    });
    test("Should normalize bot variable keys", async function(): Promise<void> {
        for (const key in constants.envVars) {
            const jumbled = key
                .replace('a', 's')
                .toLowerCase();
            assert.equal(normalizeEnvKeys(jumbled), key);
        }
    });
    test("Should return Csharp language", async function(): Promise<void> {
        const root = getWorkspaceRoot();

        await deleteCodeFiles();
        await fsP.writeFile(`${ root }\\test.cs`, 'test');
        assert.equal(await getLanguage(), constants.sdkLanguages.Csharp);
    });
    test("Should return Node language", async function(): Promise<void> {
        const root = getWorkspaceRoot();

        await deleteCodeFiles();
        await fsP.writeFile(`${ root }\\test.js`, 'test');
        assert.equal(await getLanguage(), constants.sdkLanguages.Node);
    });
    test("Should return Typescript language", async function(): Promise<void> {
        const root = getWorkspaceRoot();

        await deleteCodeFiles();

        try {
            await fsP.mkdir(`${ root }\\src`);
        } catch (err) { }
        await fsP.writeFile(`${ root }\\src\\test.ts`, 'test');
        assert.equal(await getLanguage(), constants.sdkLanguages.Typescript);
    });
    test("Should not prompt for variable if it exists", async function(): Promise<void> {
        const testName = 'testBotNameTEST';
        await setBotVariable({ BotName: testName });
        const func = async (): Promise<void> => {
            await promptForVariableIfNotExist('BotName');
        };
        assert.doesNotThrow(func);
    });
    test("Should display input prompt and not resolve/reject if variable doesn't exist", async function(): Promise<void> {
        // There's no way to check if the InputBox is displayed, so instead we're basically just checking if promptForVariableIfNotExist hasn't resolved yet
        const promise = promptForVariableIfNotExist('idonotexist');
        // Wait to ensure prompt box is displayed
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
        assert.notEqual(promise, undefined);
    });
    test("Each Env Variable prompt should have prompt text and a regex validator", function(): void {
        for (const key in constants.envVarPrompts) {
            assert.equal(typeof constants.envVarPrompts[key].prompt, 'string');
            assert(constants.envVarPrompts[key].validator instanceof RegExp);
        }
    });
    test("Should correctly validate RegExp", function(): void {
        for (const key in constants.envVarPrompts) {
            const validator = (constants.envVarPrompts[key].validator as RegExp);
            const shouldBeTrue = inputIsValid(new RandExp(validator).gen(), validator);
            assert.equal(shouldBeTrue, true);

            const shouldBeInvalidForAll = '!';
            const shouldBeFalse = inputIsValid(shouldBeInvalidForAll, validator);
            assert.equal(shouldBeFalse, false);
        }
    });
    test("Should correctly convert an array to RegExp", function(): void {
        const array = [
            'test',
            'ok',
            '(?:abc)'
        ];
        const actualCaratDollar = arrayToRegex(array, true, true).source;
        const expectedCaratDollar = new RegExp(/^(test|ok|(?:abc))$/).source;
        assert.equal(actualCaratDollar, expectedCaratDollar);

        const actualCarat = arrayToRegex(array, true, false).source;
        const expectedCarat = new RegExp(/^(test|ok|(?:abc))/).source;
        assert.equal(actualCarat, expectedCarat);

        const actualDollar = arrayToRegex(array, false, true).source;
        const expectedDollar = new RegExp(/(test|ok|(?:abc))$/).source;
        assert.equal(actualDollar, expectedDollar);

        const actual = arrayToRegex(array, false, false).source;
        const expected = new RegExp(/(test|ok|(?:abc))/).source;
        assert.equal(actual, expected);
    });
});