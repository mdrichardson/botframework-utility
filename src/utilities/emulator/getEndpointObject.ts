import * as constants from '../../constants';
import { BotVariables, Endpoint } from "../../interfaces";
import { promptForVariableIfNotExist } from '../variables';

export async function getEndpointObject(name: string, settings: Partial<BotVariables>): Promise<Endpoint> {
    const appIdPrompt = `Enter ${ constants.regex.endpointSuffixes.AppId } for ${ name }`;
    const appIdValidator = constants.regex.forValidations.GUID;
    const appPass = `Enter ${ constants.regex.endpointSuffixes.AppPassword } for ${ name }`;
    const appPassValidator = constants.regex.forValidations.MicrosoftAppPassword;
    const endpoint: Endpoint = {
        AppId: settings[`${ name }_AppId`] || 
            settings[`${ name }_AppId`.toLowerCase()] || 
            settings.MicrosoftAppId || 
            await promptForVariableIfNotExist(`${ name }_AppId`, appIdPrompt, appIdValidator),
        AppPassword: settings[`${ name }_AppPassword`] || 
            settings[`${ name }_AppPassword`.toLowerCase()] || 
            settings.MicrosoftAppId || 
            await promptForVariableIfNotExist(`${ name }_AppPassword`, appPass, appPassValidator),
        Endpoint: (settings[name] as string),
        Name: name,
    };
    return endpoint;
}