import * as constants from '../../constants';
import { executeTerminalCommand } from "../deployment/executeTerminalCommand";
import { CommandOptions } from "../../interfaces/CommandOptions";

export async function getCurrentAzCliVersion(isTest?: boolean): Promise<string> {
    const options: CommandOptions = {
        commandFailedRegex: constants.regex.forDispose.GeneralTerminalFailure,
        isTest: isTest,
        returnRegex: constants.regex.forVariables.AzCliVersion,
        timeout: 10000,
    };
    const matches = (await executeTerminalCommand('az -v', options) as RegExpExecArray);
    return matches.groups && matches.groups['version'] ? matches['groups']['version'] : '0.0.0';
}