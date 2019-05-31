import * as constants from '../../constants';
import { EmulatorParams } from '../../interfaces';

export function getEmulatorLaunchCommand(url: string,
    params: EmulatorParams = {
        action: 'open',
        domain: 'livechat',
    }): string {
    const { action = 'open', domain = 'livechat', appId, appPassword, botFileSecret } = params;
    
    url = encodeURIComponent(url);

    let opener;

    switch (process.platform) {
        case 'darwin':
            opener = constants.terminal.openers.osx;
            break;
        case 'win32':
            opener = constants.terminal.openers.windows;
            break;
        default:
            opener = constants.terminal.openers.linux;
            break;
    }

    let command = `${ opener } "bfemulator://${ domain }.${ action }?botUrl=${ url }`;
    if (appId) {
        command += `&msaAppId=${ appId }`;
    }
    if (appPassword) {
        command += `&msaPassword=${ appPassword }`;
    }
    if (botFileSecret) {
        command += `&secret=${ botFileSecret }`;
    }

    command += '"';
    
    return command;
}