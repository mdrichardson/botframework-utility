import * as constants from '../constants';
import * as vscode from 'vscode';

import dotenv = require('dotenv');
import fs = require('fs');

import { BotVariables, PromptAndValidator } from '../interfaces';
import FuzzyMatching = require('fuzzy-matching');

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

export async function getEnvBotVariables(): Promise<Partial<BotVariables>> {
    const envString = process.env.BOTFRAMEWORK_UTILITY || '{}';
    return JSON.parse(envString);
}

export async function setBotVariable(variablesToAdd: Partial<BotVariables>): Promise<void> {
    // Add new variables to vsCode env
    const currentBotVariables = await getEnvBotVariables();
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

export async function setEnvBotVariables(fullBotVariables: Partial<BotVariables>): Promise<void> {
    process.env.BOTFRAMEWORK_UTILITY = JSON.stringify(fullBotVariables, null, 2);
}

export async function syncLocalBotVariablesToEnv(): Promise<void> {
    const localVariables = await getLocalBotVariables();
    await setEnvBotVariables(localVariables);
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
    let lang;
    const cSharp = await vscode.workspace.findFiles('*.cs', null, 1);
    if (cSharp) {
        lang = constants.sdkLanguages.Csharp;
    } else {
        const typeScript = await vscode.workspace.findFiles('src/*.ts', null, 1);
        lang = typeScript ? constants.sdkLanguages.Typescript : constants.sdkLanguages.Node;
    }
    return lang;
}

export function getWorkspaceRoot(): string {
    return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : __dirname;
}

export async function promptForVariableIfNotExist(variable: string, prompt?: string, validator?: RegExp): Promise<void> {
    let value;
    if (variable === constants.envVars.CodeLanguage) {
        value = await getLanguage();
    } else {
        // If prompt and validator not included, try to get them from constants
        if (!prompt && !validator) {
            const promptAndValidator = getPromptAndValidator(variable);
            if (promptAndValidator) {
                prompt = promptAndValidator.prompt;
                validator = promptAndValidator.validator;
            }
        }
        let settings = (await getEnvBotVariables() as BotVariables);
        if (!settings[variable] || !settings[variable].trim()) {
            value = await vscode.window.showInputBox({ prompt: prompt }) || '';
            if (validator && !(await inputIsValid(value, validator))) {
                promptForVariableIfNotExist(variable, prompt, validator);
                return;
            }         
        } else { return; }
    }
    await setBotVariable({ [variable]: value });
}

function getPromptAndValidator(variable: string): PromptAndValidator|null {
    return constants.envVarPrompts[variable] ? { prompt: constants.envVarPrompts[variable].prompt, validator: constants.envVarPrompts[variable].validator } : null;
}

async function inputIsValid(value: string, validator: RegExp): Promise<boolean> {
    if (value.match(validator)) {
        return true;
    } else {
        await vscode.window.showErrorMessage(`Invalid Input. See log for details`);
        console.log(`INVALID INPUT. VALID REGEXP:\n${ validator }`);
        return false;
    }
}

// Returns /^(item1|item2)$/ if includeCaratAtStart and includeDollarAtEnd are true
export function arrayToRegex(array: string[], includeCaratAtStart: boolean = true, includeDollarAtEnd: boolean = true): RegExp {
    const carat = includeCaratAtStart ? '^' : '';
    const dollar = includeDollarAtEnd ? '$' : '';
    const joinedRegionCodes = array.reduce((prev, curr): string => `${ prev }|${ curr }`);
    return new RegExp(`${ carat }(${ joinedRegionCodes })${ dollar }`);
}