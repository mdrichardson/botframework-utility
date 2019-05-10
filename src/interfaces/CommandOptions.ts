export interface CommandOptions {
    commandCompleteRegex?: RegExp;
    commandFailedRegex?: RegExp;
    commandTitle?: string;
    isTest?: boolean;
    timeout?: number;
}