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
            // No need for if/else for matches because part of getting keyType is getting the named capture group
            const matches = (constants.regex.endpointNameRegex.exec(key) as RegExpExecArray);
            const name = (matches.groups as object)['EndpointName'];
            endpoints.push(await getEndpointObject(name, settings));
        }
    }
    return endpoints;
}