import { BotVariables, EnvVarPrompts } from './interfaces';
import { arrayToRegex } from './utilities/variables';

const azureRegionCodes = [
    'australiaeast',
    'australiacentral',
    'australiacentral2',
    'australiasoutheast',
    'eastasia',
    'southeastasia',
    'eastus',
    'eastus2',
    'southcentralus',
    'westcentralus',
    'westus',
    'westus2',
    'brazilsouth',
    'centralus',
    'northcentralus',
    'japanwest',
    'japaneast',
    'southindia',
    'centralindia',
    'westindia',
    'canadacentral',
    'canadaeast',
    'koreacentral',
    'koreasouth',
    'germanycentral',
    'germanynortheast',
    'northeurope',
    'westeurope',
    'uksouth',
    'ukwest',
    'francecentral',
    'francesouth',
    'virginia',
    'usgovvirginia',
    'usgoviowa',
    'usdodeast',
    'usdodcentral',
    'usgovtexas',
    'usgovarizona'
];

export const envVars: BotVariables = {
    BotName: 'BotName',
    CodeLanguage: 'CodeLanguage',
    Location: 'Location',
    MicrosoftAppId: 'MicrosoftAppId',
    MicrosoftAppPassword: 'MicrosoftAppPassword',
    ResourceGroupName: 'ResourceGroupName',
    ServicePlanName: 'ServicePlanName',
};

export const regexForValidations = {
    CodeLanguage: /^(?:Csharp|Node|Typescript)$/,
    GUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    Location: arrayToRegex(azureRegionCodes),
    MicrosoftAppPassword: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{16,}$/,
    ResourceGroups: /^[\w\.\-)(]+(?<!\.)$/,
    WordsOnly: /^\w{4,}$/,
};

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

export const sdkLanguages = {
    Csharp: 'Csharp',
    Node: 'Node',
    Typescript: 'Typescript'
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
    CreateAzureResources: /"provisioningState": "Succeeded",/g,
    Deploy: /"complete": true,[\s\S]*"deployer":.*"Push-Deployer",/g,
    DeploymentFailed: /(?:found in)/g,
    Emulator: /Adding extension JSON/g,
    // Prep Pub: There's no success message, so we need to handle success and failure
    PrepareDeploy: />\[0K\[89G/g,
    WebappCreate: /"appId":.*".{36}"[\s\S]*"appLogoUrl": null,/g,
};

export const deploymentTemplates = {
    // Must use quotes since keys contain "-"
    'template-with-new-rg.json': 'template-with-new-rg.json',
    'template-with-preexisting-rg.json': 'template-with-preexisting-rg.json',
};

export const urls = {
    'template-with-new-rg.json': 'https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/samples-work-in-progress/samples/csharp_dotnetcore/13.core-bot/DeploymentTemplates/template-with-new-rg.json',
    'template-with-preexisting-rg.json': 'https://raw.githubusercontent.com/Microsoft/BotBuilder-Samples/samples-work-in-progress/samples/csharp_dotnetcore/13.core-bot/DeploymentTemplates/template-with-preexisting-rg.json',
};

export const testing = {
    TerminalOutput: 'terminalOutput.txt',
};