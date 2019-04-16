import * as vscode from 'vscode';
import * as fs from 'fs';

const dotenv = require('dotenv');
const FuzzyMatching = require('fuzzy-matching');

export function createEmulatorUri(url: string, domain: string = 'livechat', action: string = 'open'): vscode.Uri {
    return vscode.Uri.parse(`bfemulator://${domain}.${action}?botUrl=${url}`);
}

export async function getBotSettings(): Promise<object> {
    const dotenvFile = await vscode.workspace.findFiles(`**/*.env`, null, 1);
    const appsettingsJsonFile = await vscode.workspace.findFiles(`**/appsettings.json`, null, 1);
    let botSettings: any = {};
    if (dotenvFile[0]) {
        const json = dotenv.parse(fs.readFileSync(dotenvFile[0].fsPath));
        for (const key in json) {
            const normalizedKey = normalizeEnvKeys(key);
            botSettings[normalizedKey] = json[key];
        }
    } 
    else if (appsettingsJsonFile[0]) {
        const raw = String(fs.readFileSync(appsettingsJsonFile[0].fsPath));
        const json = JSON.parse(raw);
        for (const key in json) {
            const normalizedKey = normalizeEnvKeys(key);
            botSettings[normalizedKey] = json[key];
        }
    }
    return botSettings;
}

function normalizeEnvKeys(key: string): string {
    const fm = new FuzzyMatching([
        'MicrosoftAppId',
        'MicrosoftAppPassword'
    ]);
    return fm.get(key).value;
}