import { IBOTFRAMEWORK_UTILITY } from "./utilities";

export const envVars: IBOTFRAMEWORK_UTILITY = {
    MicrosoftAppId: 'MicrosoftAppId',
    MicrosoftAppPassword: 'MicrosoftAppPassword',
    ResourceGroupName: 'ResourceGroupName',
    Location: 'Location',
    CodeLanguage: 'CodeLanguage',
    BotName: 'BotName'
}

export const envVarPrompts = {
    MicrosoftAppId: 'Enter your Microsoft App Id',
    MicrosoftAppPassword: 'Enter your Microsoft App Password',
    ResourceGroupName: 'Enter your Resource Group Name - Resource Group MUST EXIST!',
    ResourceGroupNameBeingCreated: 'Enter your Resource Group Name',
    Location: 'Enter your Resource Group Location (ex: westus, westus2, eastus)',
    CodeLanguage: 'What language is your code in? [Node / Csharp]',
    BotName: 'Enter a name for your bot',
}

export const sdkLanguages = {
    Csharp: 'Csharp',
    Node: 'Node'
}

export const settingsFiles = {
    Csharp: 'appsettings.json',
    Node: '.env'
}