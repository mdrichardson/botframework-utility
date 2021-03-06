import * as constants from '../../constants';
import * as vscode from 'vscode';
import { promptForVariableIfNotExist, getEnvBotVariables } from '..';

export async function getPrepareDeployCommand(): Promise<string> {
    await promptForVariableIfNotExist(constants.variables.botVariables.CodeLanguage);
    
    const settings = getEnvBotVariables();

    let csprojFile;
    if (settings.CodeLanguage === constants.variables.sdkLanguages.Csharp) {
        const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
        csprojFile = csproj[0].fsPath.split('\\').pop();
    }

    const cSharpArg = csprojFile ? ` --proj-file-path "${ csprojFile }"` : '';
    return `az bot prepare-deploy --lang ${ settings.CodeLanguage } --code-dir "."${ cSharpArg }`;
}