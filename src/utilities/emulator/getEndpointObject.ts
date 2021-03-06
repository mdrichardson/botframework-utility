import * as constants from '../../constants';
import { BotVariables, Endpoint } from "../../interfaces";
import { promptForVariableIfNotExist } from '../variables';

export async function getEndpointObject(name: string, settings: Partial<BotVariables>): Promise<Endpoint> {
    const appIdPrompt = `Enter ${ constants.regex.endpointSuffixes.AppId } for ${ name }. Leave blank to use existing`;
    const appIdValidator = constants.regex.forValidations.GUID;

    const appPassPrompt = `Enter ${ constants.regex.endpointSuffixes.AppPassword } for ${ name }. Leave blank to use existing`;
    const appPassValidator = constants.regex.forValidations.MicrosoftAppPassword;

    const hostPrompt = `Enter ${ constants.regex.endpointSuffixes.Host } for ${ name }`;
    const hostValidator = constants.regex.forValidations.Website;
    const hostPlaceholder = 'https://<yourHost>.azurewebsites.net/api/messages';

    const endpoint: Endpoint = {
        AppId: settings[`${ name }_${ constants.regex.endpointSuffixes.AppId }`] || 
            settings[`${ name }_${ constants.regex.endpointSuffixes.AppId }`.toLowerCase()] || 
            await promptForVariableIfNotExist(`${ name }_${ constants.regex.endpointSuffixes.AppId }`, { prompt: appIdPrompt, regexValidator: appIdValidator }) ||
            settings.MicrosoftAppId ||
            '',
        AppPassword: settings[`${ name }_${ constants.regex.endpointSuffixes.AppPassword }`] || 
            settings[`${ name }_${ constants.regex.endpointSuffixes.AppPassword }`.toLowerCase()] || 
            await promptForVariableIfNotExist(`${ name }_${ constants.regex.endpointSuffixes.AppPassword }`, { prompt: appPassPrompt, regexValidator: appPassValidator }) ||
            settings.MicrosoftAppPassword ||
            '',
        Host: settings[name] || 
            await promptForVariableIfNotExist(`${ name }`, { placeHolder: hostPlaceholder, prompt: hostPrompt, regexValidator: hostValidator, value: hostPlaceholder }),
        Name: name,
    };
    return endpoint;
}