import * as constants from '../../constants';
import { Endpoint } from "../../interfaces";
import { setBotVariables } from "../variables";

export async function writeEndpointToEnv(endpoint: Endpoint): Promise<void> {
    await setBotVariables({
        [endpoint.Name]: endpoint.Host,
        [`${ endpoint.Name }_${ constants.regex.endpointSuffixes.AppId }`]: endpoint.AppId,
        [`${ endpoint.Name }_${ constants.regex.endpointSuffixes.AppPassword }`]: endpoint.AppPassword,
    });
}