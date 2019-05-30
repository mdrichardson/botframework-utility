import { Endpoint } from "../../interfaces";
import { promptForNewEndpoint, getEndpointFromQuickPick, getEndpoints } from ".";

export async function getSingleEndpoint(): Promise<Endpoint|undefined> {
    const endpoints = await getEndpoints();
    
    let endpoint: Endpoint|undefined;
    switch(endpoints.length) {
        case 0:
            endpoint = await promptForNewEndpoint();
            break;
        case 1:
            endpoint = endpoints[0];
            break;
        default:
            endpoint = await getEndpointFromQuickPick(endpoints);
            break;
    }
    return endpoint;
}