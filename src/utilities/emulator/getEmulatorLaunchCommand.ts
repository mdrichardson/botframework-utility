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
        /* istanbul ignore next: won't test on OSX */
        case 'darwin':
            opener = 'open';
            break;
        case 'win32':
            opener = 'start';
            break;
        /* istanbul ignore next: won't test on Linux */
        default:
            opener = 'xdg-open';
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