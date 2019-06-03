import { arrayToRegex } from '../utilities/variables/arrayToRegex';
import { azureRegionCodes } from './deployment';

export const forDispose = {
    CreateAzureResources: /"provisioningState": "Succeeded",/g,
    CreateAzureResourcesError: /(Azure Error|Deployment failed|ResourceGroupNotFound|ResourceDeploymentFailure|Azure Error:)/g,
    Deploy: /"complete": true,[\s\S]*"deployer":.*"Push-Deployer",/g,
    DeployFailed: /ResourceNotFound/g,
    Emulator: /Adding extension JSON/g,
    GeneralTerminalFailure: /(is not recognized as the name of a cmdlet,)|(: command not found)|(is not recognized as an internal or external command)/g,
    GitClone: /\[new branch\]\s*master\s*->\s*origin\/master/gim,
    GitCloneFailed: /error:\s*Sparse\s*checkout\s*/gim,
    // Prep Pub: There's no success message, so we need to handle success and failure
    PrepareDeploy: />\[0K\[89G|\[\?25h/g,
    PrepareDeployFailed: /(?:found in)/g,
    UpdateCliTools: /updated \d packages in/g,
    UpdateCliToolsFailed: /404 Not Found - GET https:\/\/registry.npmjs.com\//g,
    WebappCreate: /"appId":.*".{36}"[\s\S]*"appLogoUrl": null,/g,
};

export const forValidations = {
    CodeLanguage: /^(?:Csharp|Node|Typescript)$/,
    GUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    Location: arrayToRegex(azureRegionCodes),
    MicrosoftAppPassword: /^[\w@#$%^&*\-!=\[\]{}|:‘,.?/`~();]{16,}$/,
    ResourceGroups: /^[\w\.\-)(].*[^\.]$/,
    Website: /^https?:\/\/[\w\/\.:]*\/api\/messages\/?$/i,
    WordsOnly: /^\w{4,}$/,
};

export const endpointNameRegex = /(?<EndpointName>^Endpoint_\w*|^Endpoint)/i;

export const endpointSuffixes = {
    AppId: 'AppId',
    AppPassword: 'AppPassword',
    Host: 'Host',
    Name: 'Name'
};

export const endpointKeys = {
    AppId: new RegExp(`^${ endpointNameRegex.source }_${ endpointSuffixes.AppId }$`, 'i'),
    AppPassword: new RegExp(`^${ endpointNameRegex.source }_${ endpointSuffixes.AppPassword }$`, 'i'),
};

// We .slice() to remove the ^ and $ to make RegEx global match work
export const forVariables = {
    AzCliCurrentVersion: /The current version of the CLI is <strong>(?<version>[\d.]*)<\/strong>./,
    AzCliVersion: /azure-cli\s*(?<version>[\d.]*)/,
    MicrosoftAppId: new RegExp(`"appId":.*"(?<MicrosoftAppId>${ forValidations.GUID.source.slice(1, -1) })"`, 'g'),
    // There might be other special characters, but I think that's all of them
    MicrosoftAppPassword: new RegExp(`"appPassword":.*"(?<MicrosoftAppPassword>${ forValidations.MicrosoftAppPassword.source.slice(1, -1) })"`, 'g'),
};

export const terminalPaths = {
    bash: /^\/?bin\/bash|sh$/gi,
    commandPrompt: /command|cmd/i,
    powershell: /powershell|pwsh/i,
};