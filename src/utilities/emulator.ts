import * as vscode from 'vscode';

export function createEmulatorUri(url: string, domain: string = 'livechat', action: string = 'open'): vscode.Uri {
    return vscode.Uri.parse(`bfemulator://${ domain }.${ action }?botUrl=${ url }`);
}