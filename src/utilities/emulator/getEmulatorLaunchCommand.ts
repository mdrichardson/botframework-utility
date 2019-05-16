export function getEmulatorLaunchCommand(url: string, domain: string = 'livechat', action: string = 'open'): string {
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
    
    return `${ opener } bfemulator://${ domain }.${ action }?botUrl=${ url }`;
}