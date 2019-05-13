import { EnvVarPrompts } from '../interfaces';
import { regexForValidations } from './regexForValidations';

export const envVarPrompts: EnvVarPrompts = {
    BotName: { prompt: 'Enter a name for your bot', validator: regexForValidations.WordsOnly },
    CodeLanguage: { prompt: 'What language is your code in? [Csharp / Node / Typescript]', validator: regexForValidations.CodeLanguage },
    Location: { prompt: 'Enter your Resource Group Location (ex: westus, westus2, eastus)', validator: regexForValidations.Location },
    MicrosoftAppId: { prompt: 'Enter your Microsoft App Id', validator: regexForValidations.GUID},
    MicrosoftAppPassword: { prompt: 'Enter your Microsoft App Password', validator: regexForValidations.MicrosoftAppPassword },
    MicrosoftAppPasswordBeingCreated: { prompt: 'Create an App Password - At least: 16 chars, 1 lower, 1 upper, 1 num', validator: regexForValidations.MicrosoftAppPassword },
    ResourceGroupName: { prompt: 'Enter your Resource Group Name - Resource Group MUST EXIST!', validator: regexForValidations.ResourceGroups },
    ResourceGroupNameBeingCreated: { prompt: 'Enter a Name for Your Resource Group', validator: regexForValidations.ResourceGroups },
    ServicePlanName: { prompt: 'Enter your existing Service Plan\'s Name', validator: regexForValidations.WordsOnly },
    ServicePlanNameBeingCreated: { prompt: 'Enter a name for your Service Plan', validator: regexForValidations.WordsOnly },
};