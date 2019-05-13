import * as vscode from 'vscode';
import { log } from '..';

export function inputIsValid(value: string, validator: RegExp): boolean {
    if (value.match(validator)) {
        return true;
    } else {
        vscode.window.showErrorMessage(`Invalid Input. See Output for details`);
        log(`INVALID INPUT: ${ value }\nREGEXP VALIDATOR: ${ validator }`, true);
        return false;
    }
}