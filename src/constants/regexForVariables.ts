export const regexForVariables = {
    MicrosoftAppId: /"appId":.*"(?<MicrosoftAppId>.{36})",/g,
    MicrosoftAppPassword: /"appPassword":.*"(?<MicrosoftAppPassword>.{16,})",/g,
};