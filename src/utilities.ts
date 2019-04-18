import * as vscode from 'vscode';
import * as fs from 'fs';
import * as constants from './constants';

import dotenv = require('dotenv');
import FuzzyMatching = require('fuzzy-matching');

export interface BotVariables {
    MicrosoftAppId: string;
    MicrosoftAppPassword: string;
    ResourceGroupName: string;
    Location: string;
    CodeLanguage: string;
    BotName: string;
    [index: string]: string;
}

export function createEmulatorUri(url: string, domain: string = 'livechat', action: string = 'open'): vscode.Uri {
    return vscode.Uri.parse(`bfemulator://${ domain }.${ action }?botUrl=${ url }`);
}

export async function getLocalBotVariables(): Promise<Partial<BotVariables>> {
    const dotenvFile = await vscode.workspace.findFiles(`**/*${ constants.settingsFiles.Node }`, null, 1);
    const appsettingsJsonFile = await vscode.workspace.findFiles(`**/${ constants.settingsFiles.Csharp }`, null, 1);
    let botSettings: Partial<BotVariables> = {};
    // Read settings from file
    if (dotenvFile[0]) {
        const json = dotenv.parse(fs.readFileSync(dotenvFile[0].fsPath));
        for (const key in json) {
            botSettings[normalizeEnvKeys(key)] = json[key];
        }
    } 
    if (appsettingsJsonFile[0]) {
        const raw = String(fs.readFileSync(appsettingsJsonFile[0].fsPath));
        const json = JSON.parse(raw);
        for (const key in json) {
            botSettings[normalizeEnvKeys(key)] = json[key];
        }
    }
    return botSettings;
}

export async function getEnvBotVariables(): Promise<BotVariables> {
    const envString = process.env.BOTFRAMEWORK_UTILITY || '{}';
    return JSON.parse(envString);
}

export async function getAndSyncLocalAndEnvVariables(): Promise<Partial<BotVariables>> {
    const currentBotEnvVariables = await getEnvBotVariables();
    const currentBotLocalVariables = await getLocalBotVariables();
    const mergedVariables = {};
    for (const key in currentBotEnvVariables) {
        mergedVariables[normalizeEnvKeys(key)] = currentBotEnvVariables[key];
    };
    for (const key in currentBotLocalVariables) {
        mergedVariables[normalizeEnvKeys(key)] = currentBotLocalVariables[key];
    };
    await setFullBotVariables(mergedVariables);
    return mergedVariables;
}

export async function setBotVariable(variablesToAdd: Partial<BotVariables>): Promise<void> {
    // Add new variables to vsCode env
    const currentBotVariables = await getAndSyncLocalAndEnvVariables();
    let changes = 0;
    for (const key in variablesToAdd) {
        const normalizedKey = normalizeEnvKeys(key);
        if (!currentBotVariables[normalizedKey]) {
            changes += 1;
            currentBotVariables[normalizedKey] = variablesToAdd[key] || '';
        }        
    }
    if (changes) {
        await setEnvBotVariables(currentBotVariables);
        await setLocalBotVariables(currentBotVariables);
    }
}

async function setFullBotVariables(fullBotVariables: Partial<BotVariables>): Promise<void> {
    await setEnvBotVariables(fullBotVariables);
    await setLocalBotVariables(fullBotVariables);
}

async function setEnvBotVariables(fullBotVariables: Partial<BotVariables>): Promise<void> {
    process.env.BOTFRAMEWORK_UTILITY = JSON.stringify(fullBotVariables, null, 2);
}

// Save to .env and appsettings.json
async function setLocalBotVariables(fullBotVariables: Partial<BotVariables>): Promise<void> {
    const root = getWorkspaceRoot();
    const envString = JSON.stringify(fullBotVariables, null, 2);
    if (await getLanguage() === constants.sdkLanguages.Csharp) {
        await fs.writeFileSync(`${ root }/${ constants.settingsFiles.Csharp }`, envString);
    } else {
        let envString = '';
        for (const key in fullBotVariables) {
            // put in .env format: Key="value"
            envString += `${ key }=\"${ fullBotVariables[key] }\"\n`;
        }
        await fs.writeFileSync(`${ root }/${ constants.settingsFiles.Node }`, envString);
    }
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

export async function getLanguage(): Promise<string> {
    const cSharp = await vscode.workspace.findFiles('*.cs', null, 1);
    const lang = cSharp ? constants.sdkLanguages.Csharp : constants.sdkLanguages.Node;
    return lang;
}

export function getWorkspaceRoot(): string {
    return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : __dirname;
}

export async function getIfNotExist(variable: string, prompt: string): Promise<void> {
    let value;
    if (variable === constants.envVars.CodeLanguage) {
        value = await getLanguage();
    } else {
        let settings = await getEnvBotVariables();
        if (!settings[variable] || !settings[variable].trim()) {
            value = await vscode.window.showInputBox({ prompt: prompt }) || '';
        } else { return; }
    }
    await setBotVariable({ [variable]: value });
}