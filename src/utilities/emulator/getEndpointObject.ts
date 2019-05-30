import * as constants from '../../constants';
import { BotVariables, Endpoint } from "../../interfaces";
import { promptForVariableIfNotExist } from '../variables';

export async function getEndpointObject(name: string, settings: Partial<BotVariables>): Promise<Endpoint> {
    const appIdPrompt = `Enter ${ constants.regex.endpointSuffixes.AppId } for ${ name }`;
    const appIdValidator = constants.regex.forValidations.GUID;

    const appPass = `Enter ${ constants.regex.endpointSuffixes.AppPassword } for ${ name }`;
    const appPassValidator = constants.regex.forValidations.MicrosoftAppPassword;

    const hostPrompt = `Enter ${ constants.regex.endpointSuffixes.Host } for ${ name }`;
    const hostValidator = constants.regex.forValidations.Website;

    const endpoint: Endpoint = {
        AppId: settings[`${ name }_${ constants.regex.endpointSuffixes.AppId }`] || 
            settings[`${ name }_${ constants.regex.endpointSuffixes.AppId }`.toLowerCase()] || 
            await promptForVariableIfNotExist(`${ name }_${ constants.regex.endpointSuffixes.AppId }`, appIdPrompt, appIdValidator) ||
            settings.MicrosoftAppId ||
            '',
        AppPassword: settings[`${ name }_${ constants.regex.endpointSuffixes.AppPassword }`] || 
            settings[`${ name }_${ constants.regex.endpointSuffixes.AppPassword }`.toLowerCase()] || 
            await promptForVariableIfNotExist(`${ name }_${ constants.regex.endpointSuffixes.AppPassword }`, appPass, appPassValidator) ||
            settings.MicrosoftAppPassword ||
            '',
        Host: settings[name] || 
            await promptForVariableIfNotExist(`${ name }`, hostPrompt, hostValidator),
        Name: name,
    };
    return endpoint;
}