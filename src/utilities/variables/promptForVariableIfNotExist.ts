import * as constants from '../../constants';
import * as vscode from 'vscode';
import { getEnvBotVariables, getLanguage, getPromptAndValidator, inputIsValid, setBotVariables } from '..';

export async function promptForVariableIfNotExist(variable: string, prompt?: string, validator?: RegExp): Promise<void> {
    let value;
    let settings = getEnvBotVariables();
    if (variable === constants.envVars.CodeLanguage && !settings.CodeLanguage) {
        value = await getLanguage();
    } else {
        // If prompt and validator not included, get them from constants. All prompts must have validator of some kind
        if (!prompt && !validator) {
            const promptAndValidator = getPromptAndValidator(variable);
            prompt = promptAndValidator.prompt;
            validator = promptAndValidator.validator;
        }
        if (!settings[variable] || !settings[variable].trim()) {
            value = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: prompt }) || '';
            /* istanbul ignore if */
            /* Ignore reason: cannot test inputBox */
            if (validator && !(await inputIsValid(value, validator))) {
                promptForVariableIfNotExist(variable, prompt, validator);
                return;
            }         
        }
    }
    await setBotVariables({ [variable]: value });
}