import * as constants from '../../constants';
import { PromptAndValidator } from '../../interfaces';

export function getPromptAndValidator(variable: string): PromptAndValidator {
    if (constants.variables.botVariablePrompts[variable]) {
        return { prompt: constants.variables.botVariablePrompts[variable].prompt, validator: constants.variables.botVariablePrompts[variable].validator };
    } else throw new Error(`Not a valid variable: ${ variable }`);
}