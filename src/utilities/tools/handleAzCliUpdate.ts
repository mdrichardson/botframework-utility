import * as vscode from 'vscode';
import * as constants from '../../constants';
import { getCurrentAzCliVersion, getLatestAzCliVersion, log } from '..';
import * as semver from 'semver';

/* istanbul ignore next: testing would require uninstalling az cli and watching for web page opening */
export async function handleAzCliUpdate(excludedMap: object): Promise<void> {
    if (excludedMap['az']) {
        return;
    }
    const currentVersion = await getCurrentAzCliVersion();
    const latestVersion = await getLatestAzCliVersion();

    if (semver.gte(latestVersion, currentVersion)) {
        log(`Your version of AZ CLI is ${ currentVersion }, but ${ latestVersion } is available.`);
        vscode.window.showInformationMessage(`You must download AZ CLI updates manually.`);
        vscode.env.openExternal(vscode.Uri.parse(constants.urls.azCliDownload));
    } else {
        log(`AZ CLI is up to date`);
    }
}