import * as constants from '../../constants';
import { getTerminalPath } from '..';

export async function getSparseCheckoutCommand(path: string): Promise<string> {
    const terminalPath = await getTerminalPath();

    for (const key in constants.terminal.pathRegex) {
        if (constants.terminal.pathRegex[key].test(terminalPath)) {
            return `echo "${ path }/*"${ constants.terminal.sparseCheckoutEnding[key] }`;
        }
    }
    return `echo ${ path }${ constants.terminal.sparseCheckoutEnding.bash }`;
}