import * as constants from '../../constants';
import * as vscode from 'vscode';
import { promptForVariableIfNotExist, getEnvBotVariables } from '..';

export default async function getPrepareDeployCommand(): Promise<string> {
    await promptForVariableIfNotExist(constants.envVars.CodeLanguage);
    
    const settings = await getEnvBotVariables();

    let csprojFile;
    if (settings.CodeLanguage === constants.sdkLanguages.Csharp) {
        const csproj = await vscode.workspace.findFiles('**/*.csproj', null, 1);
        csprojFile = csproj[0].fsPath.split('\\').pop();
    }

    const cSharpArg = csprojFile ? ` --proj-file-path "${ csprojFile }"` : '';
    return `az bot prepare-deploy --lang ${ settings.CodeLanguage } --code-dir "."${ cSharpArg }`;
}