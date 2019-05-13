import * as constants from '../../constants';
import * as vscode from 'vscode';

export async function getLanguage(): Promise<string> {
    let lang;
    const cSharp = await vscode.workspace.findFiles('*.cs', null, 1);
    if (cSharp.length > 0) {
        lang = constants.sdkLanguages.Csharp;
    } else {
        const typeScript = await vscode.workspace.findFiles('src/*.ts', null, 1);
        lang = typeScript.length > 0 ? constants.sdkLanguages.Typescript : constants.sdkLanguages.Node;
    }
    return lang;
}