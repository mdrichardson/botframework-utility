import * as constants from '../../constants';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import { BotVariables } from '../../interfaces';
import { handleLocalEnvJson } from './handleLocalEnvJson';
import fs = require('fs');
const fsP = fs.promises;

export async function getLocalBotVariables(): Promise<Partial<BotVariables>> {
    // TODO: Use fs.exists
    const dotenvFile = await vscode.workspace.findFiles(`**/*${ constants.files.settings.Node }`, null, 1);
    const appsettingsJsonFile = await vscode.workspace.findFiles(`**/${ constants.files.settings.Csharp }`, null, 1);
    let botSettings: Partial<BotVariables> = {};
    // Read settings from file
    if (dotenvFile[0]) {
        const json = dotenv.parse(await fsP.readFile(dotenvFile[0].fsPath));
        botSettings = handleLocalEnvJson(json, botSettings);
    } 
    if (appsettingsJsonFile[0]) {
        const raw = String(await fsP.readFile(appsettingsJsonFile[0].fsPath));
        const json = JSON.parse(raw);
        botSettings = handleLocalEnvJson(json, botSettings);
    }
    return botSettings;
}