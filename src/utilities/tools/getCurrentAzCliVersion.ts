import * as constants from '../../constants';
import { executeTerminalCommand } from "../deployment/executeTerminalCommand";
import { CommandOptions } from "../../interfaces/CommandOptions";

export async function getCurrentAzCliVersion(): Promise<string> {
    const options: CommandOptions = {
        commandFailedRegex: constants.regexForDispose.GeneralTerminalFailure,
        returnRegex: constants.regexForVariables.AzCliVersion,
        timeout: 10000,
    };
    const matches = (await executeTerminalCommand('az -v', options) as RegExpExecArray);
    return matches.groups && matches.groups['version'] ? matches['groups']['version'] : '0.0.0';
}