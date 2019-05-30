import * as constants from '../../constants';
import { Endpoint } from "../../interfaces";
import { getEnvBotVariables, getEndpointKeyType } from "../variables";
import { log } from '..';
import { getEndpointObject } from '.';
import { promptForNewEndpoint } from './promptForNewEndpoint';

export async function getEndpoints(): Promise<Endpoint[]> {
    const settings = getEnvBotVariables();
    let endpoints: Endpoint[] = [];
    for (const key in settings) {
        const keyType = getEndpointKeyType(key);
        if (keyType === constants.regex.endpointSuffixes.Name) {
            const matches = (constants.regex.endpointNameRegex.exec(key) as RegExpExecArray);
            if (!matches.groups || !matches.groups['EndpointName']) {
                const endpoint = await promptForNewEndpoint();
                if (endpoint) {
                    endpoints.push();
                } else {
                    log('No Endpoint Name Found');
                }
            } else {
                const name = matches.groups['EndpointName'];
                endpoints.push(await getEndpointObject(name, settings));
            }
        }
    }
    return endpoints;
}