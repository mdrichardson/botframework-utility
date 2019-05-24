import * as constants from '../../constants';
import { getVsCodeConfig } from '..';

export async function getTerminalPath(): Promise<string> {
    const userTerminalPath = (await getVsCodeConfig(constants.vsCodeConfigNames.customTerminal) as string);
    let terminalPath;
    if (!userTerminalPath) {
        switch (process.platform) {
            case 'win32':
                terminalPath = constants.terminal.platformPaths.windows;
                break;
            case 'darwin':
                terminalPath = constants.terminal.platformPaths.osx;
                break;
            default:
                terminalPath = constants.terminal.platformPaths.linux;
        }
    } else {
        terminalPath = userTerminalPath;
    }
    return terminalPath;
}