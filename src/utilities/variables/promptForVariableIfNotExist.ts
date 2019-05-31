import * as constants from '../../constants';
import * as vscode from 'vscode';
import { getEnvBotVariables, getLanguage, getPromptAndValidator, inputIsValid, setBotVariables } from '..';
import { PromptOptions } from '../../interfaces';

export async function promptForVariableIfNotExist(variable: string,
    options: PromptOptions = {
        ignoreFocusOut: true,
    }): Promise<string> {
    let result;
    let settings = getEnvBotVariables();
    if (variable === constants.variables.botVariables.CodeLanguage && !settings.CodeLanguage) {
        result = await getLanguage();
    } else {
        if (!settings[variable] || !(settings[variable] as string).trim()) {            
            // If prompt and validator not included, get them from constants. All prompts must have validator of some kind
            if (!options.prompt && !options.regexValidator) {
                const promptAndValidator = getPromptAndValidator(variable);
                options.prompt = promptAndValidator.prompt;
                options.regexValidator = promptAndValidator.validator;
            }

            result = await vscode.window.showInputBox({
                ignoreFocusOut: options.ignoreFocusOut,
                password: options.password,
                placeHolder: options.placeHolder,
                prompt: options.prompt,
                validateInput: options.validateInput,
                value: options.value,
                valueSelection: options.valueSelection,
            }, options.cancellationToken);

            if (!options.isReprompt && (!result || (options.regexValidator && !(inputIsValid(result, options.regexValidator))))) {
                vscode.window.showErrorMessage(`Please enter a value for ${ variable }`);
                options.isReprompt = true;
                promptForVariableIfNotExist(variable, options);
                return '';
            }
        // We already have the variable, so return without setting anything
        } else { return (settings[variable] as string); }
    }
    await setBotVariables({ [variable]: result });
    return result;
}