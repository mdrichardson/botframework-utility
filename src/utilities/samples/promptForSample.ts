import * as vscode from 'vscode';
import * as constants from '../../constants';

export async function promptForSample(): Promise<string|void> {
    const languages = Object.keys(constants.samples.languagesSamplesMap);
    const language = await vscode.window.showQuickPick(languages) || '';
    if (language) {
        const sample = await vscode.window.showQuickPick(Object.keys(constants.samples.languagesSamplesMap[language])) || '';
        if (sample) {
            return `${ language }/${ sample }`;
        }
    }
}