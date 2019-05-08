import * as constants from '../../constants';
import { setBotVariables } from '..';

export default async function regexToVariables(data: string): Promise<void> {
    const regexPatterns = [
        constants.regexForVariables.MicrosoftAppId,
        constants.regexForVariables.MicrosoftAppPassword
    ];

    let matches = {};
    
    await regexPatterns.forEach((r): void => {
        const match = r.exec(data) || { groups: null };
        console.log(r.source);
        console.log(JSON.stringify(match, null, 2));
        if (match.groups) {
            matches = {...matches, ...match.groups};
        }
    });

    console.log(JSON.stringify(matches, null, 2));

    if (matches) {
        await setBotVariables(matches);
    }
}