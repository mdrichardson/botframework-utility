export interface BotVariables {
    MicrosoftAppId: string;
    MicrosoftAppPassword: string;
    ResourceGroupName: string;
    Location: string;
    CodeLanguage: string;
    BotName: string;
    ServicePlanName: string;
}

export interface Commands {
    [index: string]: () => void | Promise<void>;
}

export interface PromptAndValidator {
    prompt: string|undefined;
    validator: RegExp|undefined;
}

export interface EnvVarPrompts {
    [index: string]: PromptAndValidator;
}