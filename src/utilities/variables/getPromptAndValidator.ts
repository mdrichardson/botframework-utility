import * as constants from '../../constants';
import { PromptAndValidator } from '../../interfaces';

export default function getPromptAndValidator(variable: string): PromptAndValidator|null {
    return constants.envVarPrompts[variable] ? { prompt: constants.envVarPrompts[variable].prompt, validator: constants.envVarPrompts[variable].validator } : null;
}