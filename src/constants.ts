import { BotVariables } from './utilities';

export const envVars: BotVariables = {
    MicrosoftAppId: 'MicrosoftAppId',
    MicrosoftAppPassword: 'MicrosoftAppPassword',
    ResourceGroupName: 'ResourceGroupName',
    Location: 'Location',
    CodeLanguage: 'CodeLanguage',
    BotName: 'BotName'
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
    CreateAzureResources: /"provisioningState": "Succeeded",/g
};

export const deploymentTemplates = {
    'template-with-new-rg.json': 'template-with-new-rg.json',
    'template-with-preexisting-rg.json': 'template-with-preexisting-rg.json',
};

export const urls = {
    'template-with-new-rg.json': 'https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/samples-work-in-progress/samples/csharp_dotnetcore/13.core-bot/deploymentTemplates/template-with-new-rg.json',
    'template-with-preexisting-rg.json': 'https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/samples-work-in-progress/samples/csharp_dotnetcore/13.core-bot/deploymentTemplates/template-with-preexisting-rg.json',
};