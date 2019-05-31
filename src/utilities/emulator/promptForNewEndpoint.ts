import * as vscode from 'vscode';
import { Endpoint } from "../../interfaces";
import { getEnvBotVariables, writeEndpointToEnv } from '..';
import { getEndpointObject } from './getEndpointObject';
import { modifyEndpointNameIfNecessary } from './modifyEndpointNameIfNecessary';

export async function promptForNewEndpoint(): Promise<Endpoint|undefined> {
    let name = await vscode.window.showInputBox({
        placeHolder: 'Endpoint_',
        prompt: 'Please enter a name for your endpoint',
    });

    if (name) {
        name = await modifyEndpointNameIfNecessary(name);

        const settings = getEnvBotVariables();
        const endpoint = await getEndpointObject(name, settings);
        await writeEndpointToEnv(endpoint);
        return endpoint;
    }
    return undefined;
}