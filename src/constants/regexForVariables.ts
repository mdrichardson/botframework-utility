import { regexForValidations } from './regexForValidations';

// We .slice() to remove the ^ and $ to make RegEx global match work
export const regexForVariables = {
    AzCliCurrentVersion: /The current version of the CLI is <strong>(?<version>[\d.]*)<\/strong>./,
    AzCliVersion: /azure-cli\s*(?<version>[\d.]*)/,
    MicrosoftAppId: new RegExp(`"appId":.*"(?<MicrosoftAppId>${ regexForValidations.GUID.source.slice(1, -1) })"`, 'g'),
    // There might be other special characters, but I think that's all of them
    MicrosoftAppPassword: new RegExp(`"appPassword":.*"(?<MicrosoftAppPassword>${ regexForValidations.MicrosoftAppPassword.source.slice(1, -1) })"`, 'g'),
};