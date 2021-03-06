# botframework-utility README

## Features

### Current

#### Open Endpoints in Bot Framework Emulator

* Right-click `.env` or `appsettings.json` files to open endpoints in Bot Framework Emulator
* You can also use the keybinding, `ctrl` + `alt` + `shift` + `e` (for localhost)
* `appsettings.json`/`.env` use the following format for endpoints:
  * `Endpoint_<Name>: <Host>`,
  * `Endpoint_<Name>_AppId: <MicrosoftAppId>`,
  * `Endpoint_<Name>_AppPassword: <MicrosoftAppPassword>`

#### Execute All Deployment Commands

* Open Command Palette (`ctrl` + `shift` + `p`) and type "Deploy"
* Writes all new deployment variables to `appsettings.json`/`.env` for faster future execution

![Deployment Options](https://github.com/mdrichardson/botframework-utility/blob/master/resources/deployment-options.jpg?raw=true)

#### Download Individual Samples or Open in Browser

* Open Command Palette (`ctrl` + `shift` + `p`) and type "Sample"
* Thanks [*@stevkan*](https://github.com/stevkan) for the suggestion!

![Sample Languages](https://github.com/mdrichardson/botframework-utility/blob/master/resources/samples-languages.jpg?raw=true)
![Samples](https://github.com/mdrichardson/botframework-utility/blob/master/resources/samples.jpg?raw=true)

#### Update all Bot Framework CLI tools

* Open Command Palette (`ctrl` + `shift` + `p`) and type "Update"

![Update CLI Tools](https://github.com/mdrichardson/botframework-utility/raw/master/resources/cli-tool-update.jpg?raw=true)

#### Code Snippets

* Storage:
  * Memory - `memoryStorage`
  * Azure Blob - `blobStorage`
  * Cosmos - `cosmosStorage`
* Activity Handlers - `activityHandler`
* Welcome Message - `welcomeMessage`
* Adaptive Cards - `adaptiveCard`

![Snippet Recording](https://github.com/mdrichardson/botframework-utility/raw/master/resources/snippet-recording.gif?raw=true)

### 100% Code Coverage!

### Future

* ???

## Prerequisites

* **Deployment**
  * Your VS Code terminal cannot be Bash. It doesn't play well with `az cli` on some commands. Currently, this extension launches all `az` commands in an OS-specific prompt, but can be overridden from Settings > Extension > Botframework Utility > Custom Terminal for Az Commands
  * Be sure to stay on the latest version of [AZ CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest). This will not support older versions.

## Install

[Download the `.vsix` file](https://github.com/mdrichardson/botframework-utility/releases). In VS Code, go to Extensions, click the ellipses menu in the top-right, click Install from VSIX and choose the downloaded `.vsix` file.

*Note: This is currently the only way to install this extension as I haven't published to the Marketplace.**

## Extension Settings

* Custom Terminal for Az Commands: Path to custom terminal to use when executing AZ CLI commands
* In `settings.json`, you can use `"botframework-utility.excludeCliToolsFromUpdate" to exclude tools from the Update CLI Tools feature.

## Build

Since this isn't currently in public release, you'll have to build it yourself.

1. `npm i -g vsce`
2. Clone the repo
3. Ensure `package.json` `"main"` key has a value of `"./dist/extension.js"` (it's set to `"./out/src/extension.js"` to enable test coverage).
4. From the root of the cloned repo: `vsce package`
5. In VS Code, Extensions > Install from VSIX > Select the VSIX generated from the `vsce package` command.

## Known Issues

None, currently

## Release Notes

See [Changelog](CHANGELOG.md)
