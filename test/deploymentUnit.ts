import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';

import RandExp = require('randexp');
import { BotVariables } from '../src/interfaces';
import { setBotVariables, downloadTemplate, getDeploymentTemplate, getWorkspaceRoot, deleteCodeZip, regexToVariables, getEnvBotVariables, getCreateAppRegistrationCommand, getCreateResourcesCommand, getPrepareDeployCommand, getDeployCommand, executeTerminalCommand, handleTerminalData, getTerminalPath, joinTerminalCommands } from '../src/utilities';
import { deleteDownloadTemplates, deleteTerminalOutputFile } from './testUtilities';

import fs = require('fs');
import { setVsCodeConfig } from '../src/utilities/variables/setVsCodeConfig';
const fsP = fs.promises;

var testEnv: BotVariables = {
    BotName: 'vmicricEXT',
    CodeLanguage: constants.variables.sdkLanguages.Csharp,
    Location: 'westus',
    MicrosoftAppId: '',
    MicrosoftAppPassword: 'TestPassword__0123',
    ResourceGroupName: 'vmicricEXT',
    ServicePlanName: 'vmicricEXT'    
};

suiteSetup(async (): Promise<void> => {
    await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, undefined);
});

suite("Deployment - Unit", function(): void {
    setup(async (): Promise<void> => {
        await setBotVariables(testEnv);
    });
    test("Should download both deployment templates if missing", async function(): Promise<void> {
        const timeout = 10 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        for (const template in constants.deployment.templates) {
            await deleteDownloadTemplates();
            await downloadTemplate(template);
            const exists = await vscode.workspace.findFiles(`**/${ template }`);
            assert(exists.length > 0);
        }
    });
    test("Should create the deploymentTemplates folder if it doesn't exist", async function(): Promise<void> {
        const root = getWorkspaceRoot();
        const location = `${ root }\\deploymentTemplates`;
        try {
            await deleteDownloadTemplates();
            await fsP.rmdir(location);
        } catch { }
        await getDeploymentTemplate(constants.deployment.templates["template-with-new-rg.json"]);
        const folder = await fsP.readdir(location);
        assert(folder.length > 0);
    });
    test("Should get appropriate deployment template - New RG", async function(): Promise<void> {
        const templateName = constants.deployment.templates["template-with-new-rg.json"];
        const location = await getDeploymentTemplate(templateName);
        const root = getWorkspaceRoot();
        assert.equal(location, `${ root }\\deploymentTemplates\\template-with-new-rg.json`);
    });
    test("Should get appropriate deployment template - Existing RG", async function(): Promise<void> {
        const templateName = constants.deployment.templates["template-with-preexisting-rg.json"];
        const location = await getDeploymentTemplate(templateName);
        const root = getWorkspaceRoot();
        assert.equal(location, `${ root }\\deploymentTemplates\\template-with-preexisting-rg.json`);
    });
    test("Should delete zip file", async function(): Promise<void> {
        const timeout = 10 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        await deleteCodeZip();
        // Give time for it to delete since it doesn't seem to do so immediately
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 3000));
        const file = await vscode.workspace.findFiles(`${ constants.files.zip }`);
        assert(!file.length);
    });
    test("Should Detect RegEx in data and convert to ENV variables", async function(): Promise<void> {
        const testAppId = new RandExp(constants.regex.forValidations.GUID).gen();
        const testAppPassword = new RandExp(constants.regex.forValidations.MicrosoftAppPassword).gen();
        const data = {
            appId: testAppId,
            appPassword: testAppPassword
        };
        await regexToVariables(JSON.stringify(data));
        const variables = getEnvBotVariables();
        assert.equal(variables.MicrosoftAppId, testAppId);
        assert.equal(variables.MicrosoftAppPassword, testAppPassword);
    });
    test("Should Create Appropriate App Creation Command", async function(): Promise<void> {
        const command = (await getCreateAppRegistrationCommand() as string);
        assert.equal(command, `az ad app create --display-name "${ testEnv.BotName }" --password "${ testEnv.MicrosoftAppPassword }" --available-to-other-tenants`);
    });
    test("Should Not Return Create App Command if App Id is Present", async function(): Promise<void> {
        await setBotVariables({ [constants.variables.botVariables.MicrosoftAppId]: '37765811-fc7b-4b94-9201-88cf09a1111c' });
        const command = await getCreateAppRegistrationCommand();
        assert.equal(command, undefined);
    });
    test("Should Create Appropriate Resource Creation Command - New RG, New Service", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const appId = '37765811-fc7b-4b94-9201-88cf09a1111c';
        await setBotVariables({ [constants.variables.botVariables.MicrosoftAppId]: appId });
        const templateName = constants.deployment.templates["template-with-new-rg.json"];

        const command = await getCreateResourcesCommand(true, true);

        assert.equal(command, `az deployment create --location ${ testEnv.Location } --name "${ testEnv.BotName }" --template-file "${ await getDeploymentTemplate(templateName) }" `+
            `--parameters appId="${ appId }" appSecret="${ testEnv.MicrosoftAppPassword }" botId="${ testEnv.BotName }" botSku=F0 newWebAppName="${ testEnv.BotName }" `+
            `groupName="${ testEnv.ResourceGroupName }" groupLocation="${ testEnv.Location }" newAppServicePlanName="${ testEnv.ServicePlanName }" newAppServicePlanLocation="${ testEnv.Location }"`);
    });
    test("Should Create Appropriate Resource Creation Command - Existing RG, New Service", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const appId = '37765811-fc7b-4b94-9201-88cf09a1111c';
        await setBotVariables({ [constants.variables.botVariables.MicrosoftAppId]: appId });
        const templateName = constants.deployment.templates["template-with-preexisting-rg.json"];

        const command = await getCreateResourcesCommand(false, true);

        assert.equal(command, `az group deployment create --name "${ testEnv.BotName }" --template-file "${ await getDeploymentTemplate(templateName) }" --resource-group "${ testEnv.ResourceGroupName }" `+
            `--parameters appId="${ appId }" appSecret="${ testEnv.MicrosoftAppPassword }" botId="${ testEnv.BotName }" botSku=F0 newWebAppName="${ testEnv.BotName }" `+
            `newAppServicePlanName="${ testEnv.ServicePlanName }" appServicePlanLocation="${ testEnv.Location }"`);
    });
    test("Should Create Appropriate Resource Creation Command - Existing RG, Existing Service", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const appId = '37765811-fc7b-4b94-9201-88cf09a1111c';
        await setBotVariables({ [constants.variables.botVariables.MicrosoftAppId]: appId });
        const templateName = constants.deployment.templates["template-with-preexisting-rg.json"];

        const command = await getCreateResourcesCommand(false, false);

        assert.equal(command, `az group deployment create --name "${ testEnv.BotName }" --template-file "${ await getDeploymentTemplate(templateName) }" --resource-group "${ testEnv.ResourceGroupName }" `+
            `--parameters appId="${ appId }" appSecret="${ testEnv.MicrosoftAppPassword }" botId="${ testEnv.BotName }" botSku=F0 newWebAppName="${ testEnv.BotName }" `+
            `existingAppServicePlan="${ testEnv.ServicePlanName }" appServicePlanLocation="${ testEnv.Location }"`);
    });
    test("Should Create Appropriate Prepare Deploy Command", async function(): Promise<void> {
        await setBotVariables({ [constants.variables.botVariables.CodeLanguage]: constants.variables.sdkLanguages.Csharp });
        const commandCsharp = await getPrepareDeployCommand();
        assert.equal(commandCsharp, `az bot prepare-deploy --lang Csharp --code-dir "." --proj-file-path "test.csproj"`);

        await setBotVariables({ [constants.variables.botVariables.CodeLanguage]: constants.variables.sdkLanguages.Node });
        const commandNode = await getPrepareDeployCommand();
        assert.equal(commandNode, `az bot prepare-deploy --lang Node --code-dir "."`);

        await setBotVariables({ [constants.variables.botVariables.CodeLanguage]: constants.variables.sdkLanguages.Typescript });
        const commandTypescript = await getPrepareDeployCommand();
        assert.equal(commandTypescript, `az bot prepare-deploy --lang Typescript --code-dir "."`);
    });
    test("Should Create Appropriate Deploy Command", async function(): Promise<void> {
        const command = await getDeployCommand();
        assert.equal(command, `az webapp deployment source config-zip --resource-group "${ testEnv.ResourceGroupName }" --name "${ testEnv.BotName }" --src "${ constants.files.zip }"`);
    });
    test("Should Execute Command from User Terminal Path Without Throwing", async function(): Promise<void> {
        await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe');
        try {
            executeTerminalCommand('az test');
        } catch { assert.fail(); };
    });
    test("Should Execute Command from OS Default Terminal Path Without Throwing", async function(): Promise<void> {
        try {
            await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, undefined);
            executeTerminalCommand('az test');
        } catch (err) {
            assert.fail(err);
        }
    });
    test("Should Return the Appropriate Terminal Path", async function(): Promise<void> {
        this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');

        await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, undefined);
        const path = await getTerminalPath();
        assert.equal(path, constants.terminal.platformPaths.windows);

        Object.defineProperty(process, 'platform', { value: 'linux' });
        const linuxPath = await getTerminalPath();
        assert.equal(linuxPath, constants.terminal.platformPaths.linux);

        Object.defineProperty(process, 'platform', { value: 'darwin' });
        const osxPath = await getTerminalPath();
        assert.equal(osxPath, constants.terminal.platformPaths.osx);

        Object.defineProperty(process, 'platform', this.originalPlatform);

        await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, 'testPath');
        const testPath = await getTerminalPath();
        assert.equal(testPath, 'testPath');

        await setVsCodeConfig(constants.vsCodeConfig.names.customTerminal, undefined);
    });
    test("Should Appropriately Join Terminal Commands", async function(): Promise<void> {
        const commands = [
            'first',
            'second',
            'third'
        ];
        const powershell = await joinTerminalCommands(commands, constants.terminal.platformPaths.windows);
        assert.equal(powershell, commands.join(constants.terminal.joins.powershell));

        const commandPrompt = await joinTerminalCommands(commands, 'c:\\windows\\system32\\cmd.exe');
        assert.equal(commandPrompt, commands.join(constants.terminal.joins.commandPrompt));

        const sh = await joinTerminalCommands(commands, constants.terminal.platformPaths.linux);
        assert.equal(sh, commands.join(constants.terminal.joins.bash));
    });
    test("Terminal should return false if no data and nothing checked", async function(): Promise<void> {
        const terminal = vscode.window.createTerminal();
        const result = await handleTerminalData(terminal, {});
        assert.equal(result, false);
        terminal.dispose();
    });
    test("Terminal should return regex group matches if given returnRegex", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const terminal = vscode.window.createTerminal();
        terminal.sendText('test');
        const result = (await handleTerminalData(terminal, {
            returnRegex: /(?<err>The term 'test' is not)/
        }) as RegExpMatchArray);
        assert.equal((result.groups as object)['err'], "The term 'test' is not");
        terminal.dispose();
    });
    test("Terminal should return false if it detects failure regex", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const terminal = vscode.window.createTerminal();
        terminal.sendText('test');
        const result = (await handleTerminalData(terminal, {
            commandFailedRegex: /(?<err>The term 'test' is not)/,
            timeout: 5000,
        }) as RegExpMatchArray);
        assert.equal(result, false);
        terminal.dispose();
    });
    test("Terminal should return true if it detects complete regex", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const terminal = vscode.window.createTerminal();
        terminal.sendText('test');
        const result = (await handleTerminalData(terminal, {
            commandCompleteRegex: /(?<err>The term 'test' is not)/,
            timeout: 5000,
        }) as RegExpMatchArray);
        assert.equal(result, true);
        terminal.dispose();
    });
    test("Terminal should return false if it detects fail regex before complete regex", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const terminal = vscode.window.createTerminal();
        terminal.sendText('test');
        const result = (await handleTerminalData(terminal, {
            commandCompleteRegex: /(?<err>The term 'test' is not)/,
            commandFailedRegex: /(?<err>The term 'test' is not)/,
            timeout: 5000,
        }) as RegExpMatchArray);
        assert.equal(result, false);
        terminal.dispose();
    });
    test("Should save failed terminal output on test", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        await deleteTerminalOutputFile();

        const terminal = vscode.window.createTerminal();
        terminal.sendText('test');
        const result = (await handleTerminalData(terminal, {
            commandFailedRegex: /(?<err>The term 'test' is not)/,
            isTest: true,
            timeout: 5000,
        }) as RegExpMatchArray);

        assert.equal(result, false);

        const outputFile = await vscode.workspace.findFiles(constants.testing.TerminalOutput);
        assert(outputFile.length);

        await deleteTerminalOutputFile();
        terminal.dispose();
    });
});