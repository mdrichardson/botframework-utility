import * as constants from '../../constants';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import { BotVariables } from '../../interfaces';
import fs = require('fs');
import { normalizeEnvKeys } from '..';
const fsP = fs.promises;

export default async function getLocalBotVariables(): Promise<Partial<BotVariables>> {
    const dotenvFile = await vscode.workspace.findFiles(`**/*${ constants.settingsFiles.Node }`, null, 1);
    const appsettingsJsonFile = await vscode.workspace.findFiles(`**/${ constants.settingsFiles.Csharp }`, null, 1);
    let botSettings: Partial<BotVariables> = {};
    // Read settings from file
    if (dotenvFile[0]) {
        const json = dotenv.parse(await fsP.readFile(dotenvFile[0].fsPath));
        for (const key in json) {
            botSettings[normalizeEnvKeys(key)] = json[key];
        }
    } 
    if (appsettingsJsonFile[0]) {
        const raw = String(await fsP.readFile(appsettingsJsonFile[0].fsPath));
        const json = JSON.parse(raw);
        for (const key in json) {
            botSettings[normalizeEnvKeys(key)] = json[key];
        }
    }
    return botSettings;
}