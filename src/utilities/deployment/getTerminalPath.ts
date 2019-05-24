import * as constants from '../../constants';
import { getVsCodeConfig } from '..';

export async function getTerminalPath(): Promise<string> {
    const userTerminalPath = (await getVsCodeConfig(constants.vsCodeConfigNames.customTerminalForAzCommands) as string);
    let terminalPath;
    if (!userTerminalPath) {
        switch (process.platform) {
            case 'win32':
                terminalPath = 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe';
                break;
            /* istanbul ignore next: not testing linux */
            case 'darwin':
                terminalPath = '/bin/bash';
                break;
            /* istanbul ignore next: not testing MacOS */
            default:
                terminalPath = 'sh';
        }
    } else {
        terminalPath = userTerminalPath;
    }
    return terminalPath;
}