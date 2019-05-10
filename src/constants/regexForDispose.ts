export const regexForDispose = {
    CreateAzureResources: /"provisioningState": "Succeeded",/g,
    Deploy: /"complete": true,[\s\S]*"deployer":.*"Push-Deployer",/g,
    Emulator: /Adding extension JSON/g,
    // Prep Pub: There's no success message, so we need to handle success and failure
    PrepareDeploy: />\[0K\[89G/g,
    PrepareDeployFailed: /(?:found in)/g,
    WebappCreate: /"appId":.*".{36}"[\s\S]*"appLogoUrl": null,/g,
};