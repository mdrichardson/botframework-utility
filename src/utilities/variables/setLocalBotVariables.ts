import * as constants from '../../constants';
import { BotVariables } from '../../interfaces';
import { getWorkspaceRoot, getLanguage } from '..';
import fs = require('fs');
const fsP = fs.promises;

export async function setLocalBotVariables(fullBotVariables: Partial<BotVariables>): Promise<void> {
    const root = getWorkspaceRoot();
    const envString = JSON.stringify(fullBotVariables, null, 2);
    if (await getLanguage() === constants.variables.sdkLanguages.Csharp) {
        await fsP.writeFile(`${ root }/${ constants.files.settings.Csharp }`, envString);
    } else {
        let envString = '';
        for (const key in fullBotVariables) {
            // put in .env format: Key="value"
            envString += `${ key }=\"${ fullBotVariables[key] }\"\n`;
        }
        await fsP.writeFile(`${ root }/${ constants.files.settings.Node }`, envString);
    }
}