import * as vscode from 'vscode';
import { Endpoint } from "../../interfaces";

export async function getEndpointFromQuickPick(endpoints: Endpoint[]): Promise<Endpoint|undefined> {
    const items = endpoints.map((endpoint): string => endpoint.Name );
    const endpointChoice = await vscode.window.showQuickPick(items, {
        placeHolder: 'Pick the endpoint to launch',
    });

    return endpoints.find((endpoint): boolean => endpoint.Name === endpointChoice );
}