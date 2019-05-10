import * as constants from '../../constants';
import { setBotVariables } from '..';

export default async function regexToVariables(data: string): Promise<object> {
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

    if (matches) {
        await setBotVariables(matches);
    }
    return matches;
}