import * as constants from '../../constants';
import { PromptAndValidator } from '../../interfaces';

export default function getPromptAndValidator(variable: string): PromptAndValidator {
    if (constants.envVarPrompts[variable]) {
        return { prompt: constants.envVarPrompts[variable].prompt, validator: constants.envVarPrompts[variable].validator };
    } else throw new Error(`Not a valid variable: ${ variable }`);
}