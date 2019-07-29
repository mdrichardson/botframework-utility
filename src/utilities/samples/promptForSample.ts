import * as vscode from 'vscode';
import * as constants from '../../constants';
import { Sample, SampleLanguage } from '../../interfaces';

export async function promptForSample(): Promise<Sample|void> {
    const languages = Object.keys(constants.samples.languagesSamplesMap);
    const language = (await vscode.window.showQuickPick(languages) as SampleLanguage);
    if (language) {
        const name = await vscode.window.showQuickPick(Object.keys(constants.samples.languagesSamplesMap[language])) || '';
        if (name) {
            return new Sample(language, name);
        }
    }
}