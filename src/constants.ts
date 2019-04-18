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

export const regex = {
    MicrosoftAppId: /"appId":.*"(?<MicrosoftAppId>.{36})",/g,
    MicrosoftAppPassword: /"appPassword":.*"(?<MicrosoftAppPassword>.{16,})",/g,
};