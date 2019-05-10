import * as constants from '../../constants';
import { BotVariables } from '../../interfaces';
import { getWorkspaceRoot, getLanguage } from '..';
import fs = require('fs');
const fsP = fs.promises;

export default async function setLocalBotVariables(fullBotVariables: Partial<BotVariables>): Promise<void> {
    const root = getWorkspaceRoot();
    const envString = JSON.stringify(fullBotVariables, null, 2);
    if (await getLanguage() === constants.sdkLanguages.Csharp) {
        await fsP.writeFile(`${ root }/${ constants.settingsFiles.Csharp }`, envString);
    } else {
        let envString = '';
        for (const key in fullBotVariables) {
            // put in .env format: Key="value"
            envString += `${ key }=\"${ fullBotVariables[key] }\"\n`;
        }
        await fsP.writeFile(`${ root }/${ constants.settingsFiles.Node }`, envString);
    }
}