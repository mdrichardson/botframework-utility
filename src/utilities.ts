import * as vscode from 'vscode';
import * as fs from 'fs';

const dotenv = require('dotenv');

export function createEmulatorUri(url: string, domain: string = 'livechat', action: string = 'open'): vscode.Uri {
    return vscode.Uri.parse(`bfemulator://${domain}.${action}?botUrl=${url}`);
}

export async function getBotSettings(): Promise<object> {
    const dotenvFile = await vscode.workspace.findFiles(`**/*.env`, null, 1);
    const appsettingsJsonFile = await vscode.workspace.findFiles(`**/appsettings.json`, null, 1);
    let botSettings: any = {};
    if (dotenvFile[0]) {
        dotenv.config({ path: dotenvFile[0].fsPath });
        const json = dotenv.parse(fs.readFileSync(dotenvFile[0].fsPath));
        for (const key in json) {
            botSettings[key] = json[key];
        }
    } 
    else if (appsettingsJsonFile[0]) {
        const raw = String(fs.readFileSync(appsettingsJsonFile[0].fsPath));
        const json = JSON.parse(raw);
        for (const key in json) {
            process.env[key] = json[key];
            botSettings[key] = json[key];
        }
    }
    return botSettings;
}