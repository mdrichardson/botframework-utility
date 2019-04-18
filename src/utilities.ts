import * as vscode from 'vscode';
import * as fs from 'fs';
import * as constants from './constants';

const dotenv = require('dotenv');
const FuzzyMatching = require('fuzzy-matching');

export interface IBOTFRAMEWORK_UTILITY {
    MicrosoftAppId: string,
    MicrosoftAppPassword: string,
    ResourceGroupName: string,
    Location: string,
    CodeLanguage: string,
    BotName: string,
    [index: string]: string,
}

export function createEmulatorUri(url: string, domain: string = 'livechat', action: string = 'open'): vscode.Uri {
    return vscode.Uri.parse(`bfemulator://${domain}.${action}?botUrl=${url}`);
}

export async function loadBotSettings(): Promise<void> {
    const dotenvFile = await vscode.workspace.findFiles(`**/*${constants.settingsFiles.Node}`, null, 1);
    const appsettingsJsonFile = await vscode.workspace.findFiles(`**/${constants.settingsFiles.Csharp}`, null, 1);
    let botSettings: Partial<IBOTFRAMEWORK_UTILITY> = {};
    // Read settings from file
    if (dotenvFile[0]) {
        const json = dotenv.parse(fs.readFileSync(dotenvFile[0].fsPath));
        for (const key in json) {
            const normalizedKey = normalizeEnvKeys(key);
            botSettings[normalizedKey] = json[key];
        }
    } 
    if (appsettingsJsonFile[0]) {
        const raw = String(fs.readFileSync(appsettingsJsonFile[0].fsPath));
        const json = JSON.parse(raw);
        for (const key in json) {
            const normalizedKey = normalizeEnvKeys(key);
            botSettings[normalizedKey] = json[key];
        }
    }
    // Save results to process.env
    setBotEnvVariables(botSettings);
}

// Ensure that keys retrieved from .env and appsettings.json are normalized to constants
// Allows use of the passed in key if can't be normalized
function normalizeEnvKeys(key: string): string {
    const minAcceptableDistance = 0.3; // appId vs. MicrosoftAppId = 0.36 distance
    // Acceptable keys - Everything else is ignored
    const fm = new FuzzyMatching(Object.keys(constants.envVars));
    const result = fm.get(key);
    return result.distance >= minAcceptableDistance ? result.value : key;
}

export async function getBotEnvVariables(): Promise<IBOTFRAMEWORK_UTILITY> {
    const envString = process.env.BOTFRAMEWORK_UTILITY || '{}';
    return JSON.parse(envString);
}

export async function setBotEnvVariables(botEnvVariables: Partial<IBOTFRAMEWORK_UTILITY>): Promise<void> {
    // Add new variables to vsCode env
    const currentBotEnvVariables = await getBotEnvVariables();
    let changes = 0;
    for (const key in botEnvVariables) {
        const normalizedKey = normalizeEnvKeys(key);
        if (!currentBotEnvVariables[normalizedKey]) {
            changes += 1;
            currentBotEnvVariables[normalizedKey] = botEnvVariables[key] || '';
        }        
    }
    if (changes) {
        const envString = JSON.stringify(currentBotEnvVariables, null, 2);
        process.env.BOTFRAMEWORK_UTILITY = envString;
        // Save to .env and appsettings.json
        const root = getRoot();
        if (await getLanguage() === constants.sdkLanguages.Csharp) {
            fs.writeFile(`${root}/${constants.settingsFiles.Csharp}`, envString, (err) => {
                if (err) return Promise.reject('Unable to write');
                return Promise.resolve();
            });
        } else {
            let envString = '';
            for (const key in currentBotEnvVariables) {
                // put in .env format: Key="value"
                envString += `${key}=\"${currentBotEnvVariables[key]}\"\n`;
            }
            fs.writeFileSync(`${root}/${constants.settingsFiles.Node}`, envString);
        }
    }
}

export async function getLanguage(): Promise<string> {
    const cSharp = await vscode.workspace.findFiles('*.cs', null, 1);
    const lang = cSharp ? constants.sdkLanguages.Csharp : constants.sdkLanguages.Node;
    return lang;
}

export function getRoot(): string {
    return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : __dirname;
}

export async function getIfNotExist(variable:string, prompt: string) {
    let value;
    if (variable === constants.envVars.CodeLanguage) {
        value = await getLanguage();
    } else {
        let settings = await getBotEnvVariables();
        if (!settings[variable] || !settings[variable].trim()) {
            value = await vscode.window.showInputBox({ prompt: prompt }) || '';
        } else { return; }
    }
    await setBotEnvVariables({ [variable]: value });
}