import * as vscode from 'vscode';
import * as fs from 'fs';

const dotenv = require('dotenv');
const FuzzyMatching = require('fuzzy-matching');

interface IBOTFRAMEWORK_UTILITY {
    MicrosoftAppId: string,
    MicrosoftAppPassword: string,
    ResourceGroupName: string,
    Location: string,
    [index: string]: string,
}

export function createEmulatorUri(url: string, domain: string = 'livechat', action: string = 'open'): vscode.Uri {
    return vscode.Uri.parse(`bfemulator://${domain}.${action}?botUrl=${url}`);
}

async function getBotSettings(): Promise<Partial<IBOTFRAMEWORK_UTILITY>> {
    const dotenvFile = await vscode.workspace.findFiles(`**/*.env`, null, 1);
    const appsettingsJsonFile = await vscode.workspace.findFiles(`**/appsettings.json`, null, 1);
    let botSettings: Partial<IBOTFRAMEWORK_UTILITY> = {};
    // Read settings from file
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
    // Save results to process.env
    setBotEnvVariables(botSettings);
    return botSettings;
}

// Ensure that keys retrieved from .env and appsettings.json are normalized to constants
// Allows use of the passed in key if can't be normalized
function normalizeEnvKeys(key: string): string {
    const minAcceptableDistance = 0.3; // appId vs. MicrosoftAppId = 0.36 distance
    // Acceptable keys - Everything else is ignored
    const fm = new FuzzyMatching([
        'MicrosoftAppId',
        'MicrosoftAppPassword',
        'ResourceGroupName',
        'Location'
    ]);
    const result = fm.get(key);
    return result.distance >= minAcceptableDistance ? result.value : key;
}

export async function getBotEnvVariables(): Promise<IBOTFRAMEWORK_UTILITY> {
    await getBotSettings();
    const envString = process.env.BOTFRAMEWORK_UTILITY || '{}';
    return JSON.parse(envString);
}

export async function setBotEnvVariables(botEnvVariables: Partial<IBOTFRAMEWORK_UTILITY>): Promise<void> {
    const currentBotEnvVariables = await getBotEnvVariables();
    for (const key in botEnvVariables) {
        const normalizedKey = normalizeEnvKeys(key);
        currentBotEnvVariables[normalizedKey] = botEnvVariables[key] || '';
    }
    const envString = JSON.stringify(currentBotEnvVariables);
    process.env.BOTFRAMEWORK_UTILITY = envString;
}