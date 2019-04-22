import { BotVariables } from './interfaces';

export const envVars: BotVariables = {
    MicrosoftAppId: 'MicrosoftAppId',
    MicrosoftAppPassword: 'MicrosoftAppPassword',
    ResourceGroupName: 'ResourceGroupName',
    Location: 'Location',
    CodeLanguage: 'CodeLanguage',
    BotName: 'BotName',
    ServicePlanName: 'ServicePlanName',
};

export const envVarPrompts = {
    MicrosoftAppId: 'Enter your Microsoft App Id',
    MicrosoftAppPassword: 'Enter your Microsoft App Password',
    MicrosoftAppPasswordBeingCreated: 'Create an App Password - At least: 16 chars, 1 lower, 1 upper, 1 num',
    ResourceGroupName: 'Enter your Resource Group Name - Resource Group MUST EXIST!',
    ResourceGroupNameBeingCreated: 'Enter a Name for Your Resource Group',
    Location: 'Enter your Resource Group Location (ex: westus, westus2, eastus)',
    CodeLanguage: 'What language is your code in? [Node / Csharp]',
    BotName: 'Enter a name for your bot',
    ServicePlanName: 'Enter your existing Service Plan\'s Name',
    ServicePlanNameBeingCreated: 'Enter a name for your Service Plan'
};

export const sdkLanguages = {
    Csharp: 'Csharp',
    Node: 'Node'
};

export const settingsFiles = {
    Csharp: 'appsettings.json',
    Node: '.env'
};

export const regexForVariables = {
    MicrosoftAppId: /"appId":.*"(?<MicrosoftAppId>.{36})",/g,
    MicrosoftAppPassword: /"appPassword":.*"(?<MicrosoftAppPassword>.{16,})",/g,
};

export const regexForDispose = {
    WebappCreate: /"appId":.*".{36}",/g,
    CreateAzureResources: /"provisioningState": "Succeeded",/g,
    // Prep Pub: There's no success message, so we need to handle success and failure
    PreparePublish: />\[0K\[89G/g,
    PreparePublishFailed: /(?:found in)/g,
    Publish: /"complete": true,[\s\S]*"deployer":.*"Push-Deployer",/g
};

export const regexForValidations = {
    MicrosoftAppPassword: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{16,}$/
};

export const deploymentTemplates = {
    // Must use quotes since keys contain "-"
    'template-with-new-rg.json': 'template-with-new-rg.json',
    'template-with-preexisting-rg.json': 'template-with-preexisting-rg.json',
};

export const urls = {
    'template-with-new-rg.json': 'https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/samples-work-in-progress/samples/csharp_dotnetcore/13.core-bot/deploymentTemplates/template-with-new-rg.json',
    'template-with-preexisting-rg.json': 'https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/samples-work-in-progress/samples/csharp_dotnetcore/13.core-bot/deploymentTemplates/template-with-preexisting-rg.json',
};