import { BotVariables, BotVariablePrompts } from '../interfaces';
import { regex } from '.';

export const botVariables: BotVariables = {
    BotName: 'BotName',
    CodeLanguage: 'CodeLanguage',
    Location: 'Location',
    MicrosoftAppId: 'MicrosoftAppId',
    MicrosoftAppPassword: 'MicrosoftAppPassword',
    ResourceGroupName: 'ResourceGroupName',
    ServicePlanName: 'ServicePlanName',
};

export const botVariablePrompts: BotVariablePrompts = {
    BotName: { prompt: 'Enter a name for your bot', validator: regex.forValidations.WordsOnly },
    CodeLanguage: { prompt: 'What language is your code in? [Csharp / Node / Typescript]', validator: regex.forValidations.CodeLanguage },
    Location: { prompt: 'Enter your Resource Group Location (ex: westus, westus2, eastus)', validator: regex.forValidations.Location },
    MicrosoftAppId: { prompt: 'Enter your Microsoft App Id', validator: regex.forValidations.GUID},
    MicrosoftAppPassword: { prompt: 'Enter your Microsoft App Password', validator: regex.forValidations.MicrosoftAppPassword },
    MicrosoftAppPasswordBeingCreated: { prompt: 'Create an App Password - At least: 16 chars, 1 lower, 1 upper, 1 num', validator: regex.forValidations.MicrosoftAppPassword },
    ResourceGroupName: { prompt: 'Enter your Resource Group Name - Resource Group MUST EXIST!', validator: regex.forValidations.ResourceGroups },
    ResourceGroupNameBeingCreated: { prompt: 'Enter a Name for Your Resource Group', validator: regex.forValidations.ResourceGroups },
    ServicePlanName: { prompt: 'Enter your existing Service Plan\'s Name', validator: regex.forValidations.WordsOnly },
    ServicePlanNameBeingCreated: { prompt: 'Enter a name for your Service Plan', validator: regex.forValidations.WordsOnly },
};

export const sdkLanguages = {
    Csharp: 'Csharp',
    Node: 'Node',
    Typescript: 'Typescript'
};