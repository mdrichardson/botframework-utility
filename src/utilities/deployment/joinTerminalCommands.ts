import * as constants from '../../constants';

export function joinTerminalCommands(command: string[], terminalPath: string): string {
    let commandString;
    for (const key in constants.regex.terminalPaths) {
        if (constants.regex.terminalPaths[key].test(terminalPath)) {
            commandString = command.join(constants.terminal.joins[key]);
            return commandString;
        }
    }
    return command.join(constants.terminal.joins.bash);
}