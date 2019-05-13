import * as vscode from 'vscode';

const output = vscode.window.createOutputChannel('Botframework Utility');

export default function log(text: string, show: boolean = false): void {
    output.appendLine(text);
    if (show) {
        output.show();
    }
}