import * as constants from '../../constants';
import { setBotVariables } from '..';
import { BotVariables } from '../../interfaces';

export async function regexToVariables(data: string): Promise<Partial<BotVariables>> {
    const regexPatterns = [
        constants.regexForVariables.MicrosoftAppId,
        constants.regexForVariables.MicrosoftAppPassword
    ];

    let matches = {};
    
    await regexPatterns.forEach((r): void => {
        const match = r.exec(data) || { groups: null };
        if (match.groups) {
            matches = {...matches, ...match.groups};
        }
    });

    if (Object.keys(matches).length > 0) {
        await setBotVariables(matches);
    }
    return matches;
}