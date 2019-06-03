# botframework-utility README

## Features

### Current

* Right-click `.env` or `appsettings.json` files to open endpoints in Bot Framework Emulator
  * You can also use the keybinding, `ctrl` + `alt` + `shift` + `e` (for localhost)
  * `appsettings.json`/`.env` use the following format for endpoints:
    * Endpoint_<Name>: <Host>,
    * Endpoint_<Name>_AppId: <AppId>,
    * Endpoint_<Name>_AppPassword: <AppPassword>
* Execute all deployment commands. Open Command Palette (`ctrl` + `shift` + `p`) and type "Deploy".
![Deployment Options](https://github.com/mdrichardson/botframework-utility/blob/master/resources/deployment-options.jpg?raw=true)
  * Writes all new deployment variables to `appsettings.json`/`.env` for faster future execution
* Update all Bot Framework CLI tools. Open Command Palette (`ctrl` + `shift` + `p`) and type "Update".
![Update CLI Tools](https://github.com/mdrichardson/botframework-utility/raw/master/resources/cli-tool-update.jpg?raw=true)
* 100% Code Coverage!

### Future

* ???

## Prerequisites

* **Deployment**
  * Your VS Code terminal cannot be Bash. It doesn't play well with `az cli` on some commands. Currently, this extension launches all `az` commands in an OS-specific prompt, but can be overridden from Settings > Extension > Botframework Utility > Custom Terminal for Az Commands
  * Be sure to stay on the latest version of [AZ CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest). This will not support older versions.

## Extension Settings

* Custom Terminal for Az Commands: Path to custom terminal to use when executing AZ CLI commands

## Build

Since this isn't currently in public release, you'll have to build it yourself.

1. `npm i -g vsce`
2. Clone the repo
3. From the root of the cloned repo: `vsce package`
4. In VS Code, Extensions > Install from VSIX > Select the VSIX generated from the `vsce package` command.

## Known Issues

None, currently

## Release Notes

Not currently in public release

### 0.0.1

Beta release for internal testing
