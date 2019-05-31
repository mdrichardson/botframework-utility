import * as vscode from 'vscode';

export interface PromptOptions extends vscode.InputBoxOptions {
    prompt?: string;
    regexValidator?: RegExp;
    isReprompt?: boolean;
    cancellationToken?: vscode.CancellationToken;
}