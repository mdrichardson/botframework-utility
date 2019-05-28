import * as constants from '../../constants';
import * as vscode from 'vscode';
import { getEnvBotVariables, getLanguage, getPromptAndValidator, inputIsValid, setBotVariables } from '..';

export async function promptForVariableIfNotExist(variable: string, prompt?: string, validator?: RegExp, cancellationToken?: vscode.CancellationToken, isReprompt?: boolean): Promise<void> {
    let value;
    let settings = getEnvBotVariables();
    if (variable === constants.variables.botVariables.CodeLanguage && !settings.CodeLanguage) {
        value = await getLanguage();
    } else {
        // If prompt and validator not included, get them from constants. All prompts must have validator of some kind
        if (!prompt && !validator) {
            const promptAndValidator = getPromptAndValidator(variable);
            prompt = promptAndValidator.prompt;
            validator = promptAndValidator.validator;
        }
        if (!settings[variable] || !settings[variable].trim()) {
            value = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: prompt }, cancellationToken);
            if (!isReprompt && /* istanbul ignore next: can't test input */ (!value || (validator && !(inputIsValid(value, validator))))) {
                vscode.window.showErrorMessage(`Please enter a value for ${ variable }`);
                promptForVariableIfNotExist(variable, prompt, validator, cancellationToken, true);
                return;
            }
        // We already have the variable, so return without setting anything
        } else { return; }
    }
    await setBotVariables({ [variable]: value });
    return value;
}