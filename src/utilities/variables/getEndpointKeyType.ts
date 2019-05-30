import * as constants from '../../constants';

export function getEndpointKeyType(key: string): boolean|string {
    if (key.match(constants.regex.endpointKeys.AppId)) {
        return constants.regex.endpointSuffixes.AppId;
    } 
    if (key.match(constants.regex.endpointKeys.AppPassword)) {
        return constants.regex.endpointSuffixes.AppPassword;
    }
    // Name should be last so it doesn't stop looking as soon as it finds "Endpoint_"
    if (key.match(constants.regex.endpointNameRegex)) {
        return constants.regex.endpointSuffixes.Name;
    } 
    return false;
}