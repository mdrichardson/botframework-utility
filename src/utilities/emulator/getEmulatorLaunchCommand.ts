export default function getEmulatorLaunchCommand(url: string, domain: string = 'livechat', action: string = 'open'): string {
    url = encodeURIComponent(url);

    let opener;

    switch (process.platform) {
        case 'darwin':
            opener = 'open';
            break;
        case 'win32':
            opener = 'start';
            break;
        default:
            opener = 'xdg-open';
            break;
    }
    
    return `${ opener } bfemulator://${ domain }.${ action }?botUrl=${ url }`;
}