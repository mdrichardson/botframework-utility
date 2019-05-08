import { PromptAndValidator } from './PromptAndValidator';

export interface EnvVarPrompts {
    [index: string]: PromptAndValidator;
}