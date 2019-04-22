# botframework-utility README

## Features

### Current

* Right-click `.env` or `appsettings.json` files to launch Bot Framework Emulator `localhost` endpoint
  * You can also use the keybinding, `ctrl` + `alt` + `shift` + `e`
* Execute all deployment commands. Open Command Palette (`ctrl` + `shift` + `p`) and type "Deploy".
![Deployment Options](https://github.com/mdrichardson/botframework-utility/blob/master/resources/deployment-options.jpg?raw=true)
  * Writes all new deployment variables to `appsettings.json`/`.env` for faster future execution

### Future

* Launch other endpoints by reading settings from `.env` and `appsettings.json`
* Validation for deployment variables

## Prerequisites

* **Deployment**
  * Your VS Code terminal cannot be Bash. It doesn't play well with `az cli` on some commands. Currently, this extension launches all `az` commands in an OS-specific prompt, but can be overridden from Settings > Extension > Botframework Utility > Custom Terminal for Az Commands

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
