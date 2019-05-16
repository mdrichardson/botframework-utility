import * as assert from 'assert';
import * as constants from '../src/constants';
import RandExp = require('randexp');
import { deleteEnvFiles, deleteCodeFiles, writeCodeFiles } from './testUtilities';
import { getLocalBotVariables, getEnvBotVariables, setBotVariables, normalizeEnvKeys, getLanguage, promptForVariableIfNotExist, inputIsValid, arrayToRegex, setLocalBotVariables } from '../src/utilities';

suite("Variables", function(): void {
    test("Should Load Variables from Appsettings.json", async function(): Promise<void> {
        await deleteEnvFiles();
        const data = { [constants.envVars.BotName]: 'test' };
        await setLocalBotVariables(data);
        const result = await getLocalBotVariables();
        assert.equal(result[constants.envVars.BotName], 'test');
    });
    test("Should Load Variables from .env", async function(): Promise<void> {
        await deleteEnvFiles();
        const data = { [constants.envVars.BotName]: 'test' };
        await setLocalBotVariables(data);
        const result = await getLocalBotVariables();
        assert.equal(result[constants.envVars.BotName], 'test');
    });
    test("Should Load Variables from process.env", async function(): Promise<void> {
        process.env.BOTFRAMEWORK_UTILITY = JSON.stringify({ testVar: 'test'});
        const result = getEnvBotVariables();
        assert.equal(result['testVar'], 'test');
    });
    test("Should set variables locally and to process.env - Node", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Node);
        const testName = 'testBotNameTEST';
        await setBotVariables({ [constants.envVars.BotName]: testName });

        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Node);
        const envResult = getEnvBotVariables();
        assert.equal(envResult[constants.envVars.BotName], testName);

        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Node);
        const localResult = await getLocalBotVariables();
        assert.equal(localResult[constants.envVars.BotName], testName);
    });
    test("Should set variables locally and to process.env - CSharp", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Csharp);
        const testName = 'testBotNameTEST';
        await setBotVariables({ [constants.envVars.BotName]: testName });

        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Csharp);
        const envResult = getEnvBotVariables();
        assert.equal(envResult[constants.envVars.BotName], testName);

        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Csharp);
        const localResult = await getLocalBotVariables();
        assert.equal(localResult[constants.envVars.BotName], testName);
    });
    test("Should normalize bot variable keys", async function(): Promise<void> {
        for (const key in constants.envVars) {
            const jumbled = key
                .replace('a', 's')
                .toLowerCase();
            assert.equal(normalizeEnvKeys(jumbled), key);
        }
    });
    test("Should properly get Csharp language", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Csharp);
        assert.equal(await getLanguage(), constants.sdkLanguages.Csharp);
    });
    test("Should properly get Node language", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Node);
        assert.equal(await getLanguage(), constants.sdkLanguages.Node);
    });
    test("Should properly get Typescript language", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.sdkLanguages.Typescript);
        assert.equal(await getLanguage(), constants.sdkLanguages.Typescript);
    });
    test("Should get code language if we don't know it, without prompting", async function(): Promise<void> {
        await setBotVariables({ [constants.envVars.CodeLanguage]: undefined });
        await promptForVariableIfNotExist(constants.envVars.CodeLanguage);
        const variables = getEnvBotVariables();
        assert(variables.CodeLanguage != undefined);
    });
    test("Should not prompt for variable if it exists", async function(): Promise<void> {
        const testName = 'testBotNameTEST';
        await setBotVariables({ [constants.envVars.BotName]: testName });
        const func = async (): Promise<void> => {
            await promptForVariableIfNotExist('BotName');
        };
        assert.doesNotThrow(func);
    });
    test("Should display input prompt and not resolve/reject if variable doesn't exist", async function(): Promise<void> {
        // There's no way to check if the InputBox is displayed, so instead we're basically just checking if promptForVariableIfNotExist hasn't resolved yet
        await setBotVariables({ [constants.envVars.BotName]: undefined });
        // DO NOT await promptForVariable...
        const promise = promptForVariableIfNotExist(constants.envVars.BotName);
        // Wait to ensure prompt box is displayed
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
        assert.notEqual(promise, undefined);
    });
    test("Should throw if we try to prompt for a non-existent variable", async function(): Promise<void> {
        // assert.throws doesn't work well with async, so we'll use try/catch instead
        const nonExistentVariable = 'iDoNotExist';
        try {
            await promptForVariableIfNotExist(nonExistentVariable);
            throw new Error('Expected error for non-existent variable, but did not throw.');
        } catch (err) {
            assert(err instanceof Error, `Not a valid variable: ${ nonExistentVariable }`);
        }
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