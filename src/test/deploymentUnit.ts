import * as assert from 'assert';
import * as constants from '../constants';
import * as vscode from 'vscode';

import { regexToEnvVariables, getCreateAppRegistrationCommand, getCreateResourcesCommand, getPrepareDeployCommand, getDeployCommand } from '../commands';
import { getEnvBotVariables, setBotVariable, getWorkspaceRoot, getDeploymentTemplate, createUpdateZip, deleteUpdateZip, downloadTemplate } from '../utilities';
import { BotVariables } from '../interfaces';
import { deleteDownloadTemplates } from './testUtilities';

import RandExp = require('randexp');

var testEnv: BotVariables = {
    BotName: 'vmicricEXT',
    CodeLanguage: constants.sdkLanguages.Csharp,
    Location: 'westus',
    MicrosoftAppId: '',
    MicrosoftAppPassword: 'TestPassword__0123',
    ResourceGroupName: 'vmicricEXT',
    ServicePlanName: 'vmicricEXT'    
};

suite("Deployment - Unit", function(): void {
    setup(async (): Promise<void> => {
        await setBotVariable(testEnv);
    });
    test("Should download both deployment templates if missing", async function(): Promise<void> {
        for (const template in constants.deploymentTemplates) {
            await deleteDownloadTemplates();
            await downloadTemplate(template);
            const exists = await vscode.workspace.findFiles(`**/${ template }`);
            assert(exists.length > 0);
        }
    });
    test("Should get appropriate deployment template - New RG", async function(): Promise<void> {
        const templateName = constants.deploymentTemplates["template-with-new-rg.json"];
        const location = await getDeploymentTemplate(templateName);
        const root = await getWorkspaceRoot();
        assert.equal(location, `${ root }\\deploymentTemplates\\template-with-new-rg.json`);
    });
    test("Should get appropriate deployment template - Existing RG", async function(): Promise<void> {
        const templateName = constants.deploymentTemplates["template-with-preexisting-rg.json"];
        const location = await getDeploymentTemplate(templateName);
        const root = await getWorkspaceRoot();
        assert.equal(location, `${ root }\\deploymentTemplates\\template-with-preexisting-rg.json`);
    });
    test("Should create zip file", async function(): Promise<void> {
        this.timeout(1.5 * 60 * 1000);
        await createUpdateZip();
        const file = await vscode.workspace.findFiles(`**/${ constants.zipFileName }`);
        assert(file.length > 0);
    });
    test("Should delete zip file", async function(): Promise<void> {
        await deleteUpdateZip();
        const file = await vscode.workspace.findFiles(`**/${ constants.zipFileName }`);
        assert(file.length == 0);
    });
    test("Should Detect RegEx in data and convert to ENV variables", async function(): Promise<void> {
        const testAppId = new RandExp(constants.regexForValidations.GUID).gen();
        const testAppPassword = new RandExp(constants.regexForValidations.MicrosoftAppPassword).gen();
        const data = `
            "appId": "${ testAppId }",
            "appPassword": "${ testAppPassword }",
        `;
        await regexToEnvVariables(data);
        const variables = await getEnvBotVariables();
        assert.equal(variables.MicrosoftAppId, testAppId);
        assert.equal(variables.MicrosoftAppPassword, testAppPassword);
    });
    test("Should Create Appropriate App Creation Command", async function(): Promise<void> {
        const command = (await getCreateAppRegistrationCommand() as string);
        assert.equal(command, `az ad app create --display-name "${ testEnv.BotName }" --password "${ testEnv.MicrosoftAppPassword }" --available-to-other-tenants`);
    });
    test("Should Not Return Create App Command if App Id is Present", async function(): Promise<void> {
        await setBotVariable({ MicrosoftAppId: '37765811-fc7b-4b94-9201-88cf09a1111c' });
        const command = await getCreateAppRegistrationCommand();
        assert.equal(command, undefined);
    });
    test("Should Create Appropriate Resource Creation Command - New RG, New Service", async function(): Promise<void> {
        const appId = '37765811-fc7b-4b94-9201-88cf09a1111c';
        await setBotVariable({ MicrosoftAppId: appId });
        const templateName = constants.deploymentTemplates["template-with-new-rg.json"];

        const command = await getCreateResourcesCommand(true, true);

        assert.equal(command, `az deployment create --location ${ testEnv.Location } --name "${ testEnv.BotName }" --template-file "${ await getDeploymentTemplate(templateName) }" `+
            `--parameters appId="${ appId }" appSecret="${ testEnv.MicrosoftAppPassword }" botId="${ testEnv.BotName }" botSku=F0 newWebAppName="${ testEnv.BotName }" `+
            `groupName="${ testEnv.ResourceGroupName }" groupLocation="${ testEnv.Location }" newAppServicePlanName="${ testEnv.ServicePlanName }" newAppServicePlanLocation="${ testEnv.Location }"`);
    });
    test("Should Create Appropriate Resource Creation Command - Existing RG, New Service", async function(): Promise<void> {
        const appId = '37765811-fc7b-4b94-9201-88cf09a1111c';
        await setBotVariable({ MicrosoftAppId: appId });
        const templateName = constants.deploymentTemplates["template-with-preexisting-rg.json"];

        const command = await getCreateResourcesCommand(false, true);

        assert.equal(command, `az group deployment create --name "${ testEnv.BotName }" --template-file "${ await getDeploymentTemplate(templateName) }" --resource-group "${ testEnv.ResourceGroupName }" `+
            `--parameters appId="${ appId }" appSecret="${ testEnv.MicrosoftAppPassword }" botId="${ testEnv.BotName }" botSku=F0 newWebAppName="${ testEnv.BotName }" `+
            `newAppServicePlanName="${ testEnv.ServicePlanName }" appServicePlanLocation="${ testEnv.Location }"`);
    });
    test("Should Create Appropriate Resource Creation Command - Existing RG, Existing Service", async function(): Promise<void> {
        const appId = '37765811-fc7b-4b94-9201-88cf09a1111c';
        await setBotVariable({ MicrosoftAppId: appId });
        const templateName = constants.deploymentTemplates["template-with-preexisting-rg.json"];

        const command = await getCreateResourcesCommand(false, false);

        assert.equal(command, `az group deployment create --name "${ testEnv.BotName }" --template-file "${ await getDeploymentTemplate(templateName) }" --resource-group "${ testEnv.ResourceGroupName }" `+
            `--parameters appId="${ appId }" appSecret="${ testEnv.MicrosoftAppPassword }" botId="${ testEnv.BotName }" botSku=F0 newWebAppName="${ testEnv.BotName }" `+
            `existingAppServicePlan="${ testEnv.ServicePlanName }" appServicePlanLocation="${ testEnv.Location }"`);
    });
    test("Should Create Appropriate Prepare Deploy Command", async function(): Promise<void> {
        await setBotVariable({ CodeLanguage: constants.sdkLanguages.Csharp });
        const commandCsharp = await getPrepareDeployCommand();
        assert.equal(commandCsharp, `az bot prepare-deploy --lang Csharp --code-dir "." --proj-file-path "test.csproj"`);

        await setBotVariable({ CodeLanguage: constants.sdkLanguages.Node });
        const commandNode = await getPrepareDeployCommand();
        assert.equal(commandNode, `az bot prepare-deploy --lang Node --code-dir "."`);

        await setBotVariable({ CodeLanguage: constants.sdkLanguages.Typescript });
        const commandTypescript = await getPrepareDeployCommand();
        assert.equal(commandTypescript, `az bot prepare-deploy --lang Typescript --code-dir "."`);
    });
    test("Should Create Appropriate Deploy Command", async function(): Promise<void> {
        const command = await getDeployCommand();
        assert.equal(command, `az webapp deployment source config-zip --resource-group "${ testEnv.ResourceGroupName }" --name "${ testEnv.BotName }" --src "${ constants.zipFileName }"`);
    });
});