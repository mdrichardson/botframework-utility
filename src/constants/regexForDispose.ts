export const regexForDispose = {
    CreateAzureResources: /"provisioningState": "Succeeded",/g,
    CreateAzureResourcesError: /(Azure Error|Deployment failed|ResourceGroupNotFound|ResourceDeploymentFailure|Azure Error:)/g,
    Deploy: /"complete": true,[\s\S]*"deployer":.*"Push-Deployer",/g,
    DeployFailed: /ResourceNotFound/g,
    Emulator: /Adding extension JSON/g,
    GeneralTerminalFailure: /(is not recognized as the name of a cmdlet,)|(: command not found)|(is not recognized as an internal or external command)/g,
    // Prep Pub: There's no success message, so we need to handle success and failure
    PrepareDeploy: />\[0K\[89G/g,
    PrepareDeployFailed: /(?:found in)/g,
    UpdateCliTools: /updated \d packages in/g,
    UpdateCliToolsFailed: /404 Not Found - GET https:\/\/registry.npmjs.com\//g,
    WebappCreate: /"appId":.*".{36}"[\s\S]*"appLogoUrl": null,/g,
};