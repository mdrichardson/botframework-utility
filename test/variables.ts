import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import RandExp = require('randexp');
import { clearEnvVariables, deleteCodeFiles, writeCodeFiles } from './testUtilities';
import { getLocalBotVariables, getEnvBotVariables, setBotVariables, normalizeEnvKeys, getLanguage, promptForVariableIfNotExist, inputIsValid, arrayToRegex, setLocalBotVariables, syncLocalBotVariablesToEnv, setVsCodeConfig, getVsCodeConfig } from '../src/utilities';
import sinon = require('sinon');

suite("Variables", function(): void {
    teardown((): void => {
        sinon.restore();
    });
    test("Should Get and Set VSCode Configs", async function(): Promise<void> {
        await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, 'test');
        assert.equal(await getVsCodeConfig(constants.vsCodeConfig.names.customTerminal), 'test');
        await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, undefined);
    });
    test("Should Load Variables from Appsettings.json", async function(): Promise<void> {
        this.timeout(4 * 1000);

        await clearEnvVariables();
        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Csharp);
        const data = { [constants.variables.botVariables.BotName]: 'test' };
        await setLocalBotVariables(data);
        const result = await getLocalBotVariables();
        assert.equal(result[constants.variables.botVariables.BotName], 'test');
    });
    test("Should Load Variables from .env", async function(): Promise<void> {
        this.timeout(4 * 1000);

        await clearEnvVariables();
        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Node);
        const data = { [constants.variables.botVariables.BotName]: 'test' };
        await setLocalBotVariables(data);
        const result = await getLocalBotVariables();
        assert.equal(result[constants.variables.botVariables.BotName], 'test');
    });
    test("Should Load Variables from process - Empty object if they don't exist", async function(): Promise<void> {
        process.env.BOTFRAMEWORK_UTILITY = undefined;
        const result = await getEnvBotVariables();
        assert(Object.keys(result).length === 0);
    });
    test("Should Load Variables from process.env", async function(): Promise<void> {
        process.env.BOTFRAMEWORK_UTILITY = JSON.stringify({ testVar: 'test'});
        const result = getEnvBotVariables();
        assert.equal(result['testVar'], 'test');
    });
    test("Should set variables locally and to process.env - Node", async function(): Promise<void> {
        this.timeout(6 * 1000);

        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Node);
        const testName = `testBotName_${ Math.floor(Math.random() * 1000) }`;
        await setBotVariables({ [constants.variables.botVariables.BotName]: testName });

        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Node);
        const envResult = getEnvBotVariables();
        assert.equal(envResult[constants.variables.botVariables.BotName], testName);

        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Node);
        const localResult = await getLocalBotVariables();
        assert.equal(localResult[constants.variables.botVariables.BotName], testName);
    });
    test("Should set variables locally and to process.env - CSharp", async function(): Promise<void> {
        this.timeout(6 * 1000);
        
        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Csharp);
        const testName = `testBotName_${ Math.floor(Math.random() * 1000) }`;
        await setBotVariables({ [constants.variables.botVariables.BotName]: testName });

        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Csharp);
        const envResult = getEnvBotVariables();
        assert.equal(envResult[constants.variables.botVariables.BotName], testName);

        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Csharp);
        const localResult = await getLocalBotVariables();
        assert.equal(localResult[constants.variables.botVariables.BotName], testName);
    });
    test("Should sync local bot variables to Env", async function(): Promise<void> {
        process.env.BOTFRAMEWORK_UTILITY = undefined;
        const testName = `testBotName_${ Math.floor(Math.random() * 1000) }`;
        await setLocalBotVariables({ [constants.variables.botVariables.BotName]: testName });

        await syncLocalBotVariablesToEnv();

        const envResult = await getEnvBotVariables();
        assert.equal(envResult[constants.variables.botVariables.BotName], testName);
    });
    test("Should normalize bot variable keys", async function(): Promise<void> {
        for (const key in constants.variables.botVariables) {
            const jumbled = key
                .replace('a', 's')
                .toLowerCase();
            assert.equal(normalizeEnvKeys(jumbled), key);
        }
    });
    test("Should properly get Csharp language", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Csharp);
        assert.equal(await getLanguage(), constants.variables.sdkLanguages.Csharp);
    });
    test("Should properly get Node language", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Node);
        assert.equal(await getLanguage(), constants.variables.sdkLanguages.Node);
    });
    test("Should properly get Typescript language", async function(): Promise<void> {
        await deleteCodeFiles();
        await writeCodeFiles(constants.variables.sdkLanguages.Typescript);
        assert.equal(await getLanguage(), constants.variables.sdkLanguages.Typescript);
    });
    test("Should get code language if we don't know it, without prompting", async function(): Promise<void> {
        await setBotVariables({ [constants.variables.botVariables.CodeLanguage]: undefined });
        await promptForVariableIfNotExist(constants.variables.botVariables.CodeLanguage);
        const variables = getEnvBotVariables();
        assert(variables.CodeLanguage != undefined);
    });
    test("Should not prompt for variable if it exists", async function(): Promise<void> {
        const testName = 'testBotNameTEST';
        await setBotVariables({ [constants.variables.botVariables.BotName]: testName });
        try {
            await promptForVariableIfNotExist('BotName');
        } catch (err) {
            assert.fail();
        }
    });
    test("Should not throw when prompting", async function(): Promise<void> {
        this.timeout(1.5 * 1000);

        await setBotVariables({ [constants.variables.botVariables.BotName]: undefined });
        try {
            const test = new vscode.CancellationTokenSource();
            promptForVariableIfNotExist('BotName', { cancellationToken: test.token, regexValidator: constants.regex.forValidations.WordsOnly });
            await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 500));
            test.cancel();
        } catch(err) {
            assert.fail(err);
        }
    });
    test("Should not throw when re-prompting", async function(): Promise<void> {
        this.timeout(1.5 * 1000);
        
        await setBotVariables({ [constants.variables.botVariables.BotName]: undefined });
        try {
            const test = new vscode.CancellationTokenSource();
            promptForVariableIfNotExist('BotName', { cancellationToken: test.token, isReprompt: true, regexValidator: constants.regex.forValidations.WordsOnly });
            await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 500));
            test.cancel();
        } catch(err) {
            assert.fail(err);
        }
    });
    test("Should Take Re-prompt Path If User Dismisses Input Box", async function(): Promise<void> {
        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.resolves(undefined);

        const errorSpy = sinon.spy(vscode.window, 'showErrorMessage');
        
        await setBotVariables({ [constants.variables.botVariables.BotName]: undefined });

        await promptForVariableIfNotExist('BotName', { isReprompt: false, regexValidator: constants.regex.forValidations.WordsOnly });

        assert.equal(errorSpy.callCount, 1);
    });
    test("Should prompt for variable if it doesn't exist", async function(): Promise<void> {
        await setBotVariables({ [constants.variables.botVariables.BotName]: undefined });
        const promptStub = sinon.stub(vscode.window, 'showInputBox');
        promptStub.resolves('testBotName');
        const result = await promptForVariableIfNotExist(constants.variables.botVariables.BotName);
        assert.equal(result, 'testBotName');
    });
    test("Should throw if we try to prompt for an invalid variable", async function(): Promise<void> {
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
        for (const key in constants.variables.botVariablePrompts) {
            assert.equal(typeof constants.variables.botVariablePrompts[key].prompt, 'string');
            assert(constants.variables.botVariablePrompts[key].validator instanceof RegExp);
        }
    });
    test("Should correctly validate RegExp", function(): void {
        for (const key in constants.variables.botVariablePrompts) {
            const validator = (constants.variables.botVariablePrompts[key].validator as RegExp);
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