import * as constants from '../../constants';
import * as vscode from 'vscode';

export async function openSample(sample: string): Promise<void> {
    const url = `${ constants.samples.repoRoot }/tree/master/samples/${ sample }`;
    vscode.env.openExternal(vscode.Uri.parse(url));
}