import * as constants from '../../constants';

export function joinTerminalCommands(command: string[], terminalPath: string): string {
    let commandString;
    for (const key in constants.terminal.pathRegex) {
        if (constants.terminal.pathRegex[key].test(terminalPath)) {
            commandString = command.join(constants.terminal.joins[key]);
            return commandString;
        }
    }
    return command.join(constants.terminal.joins.bash);
}