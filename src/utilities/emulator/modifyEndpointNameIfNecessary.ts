import * as constants from '../../constants';
import { getEndpoints } from '.';

export async function modifyEndpointNameIfNecessary(name: string): Promise<string> {
    if (!name.match(constants.regex.endpointNameRegex)) {
        name = `Endpoint_${ name }`;
    }

    const endpoints = await getEndpoints();
    if (endpoints.length > 0) {
        const endpointNames = endpoints.reduce((map, obj): object => {
            map[obj.Name] = true;
            return map;
        }, {});

        // Prevent duplicate names
        if (endpointNames[name]) {
            let i = 1;
            while (endpointNames[`${ name }${ i }`]) {
                i++;
            }
            name = `${ name }${ i }`;
        }
    }
    return name;
}