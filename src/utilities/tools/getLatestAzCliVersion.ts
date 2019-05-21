import Axios, { AxiosResponse } from "axios";
import * as constants from '../../constants';

export async function getLatestAzCliVersion(): Promise<string> {
    const releasePage = (await Axios.get(constants.websites.azCliDownload) as AxiosResponse);
    if (releasePage.status != 200) {
        return '0.0.0';
    }
    const matches = (constants.regexForVariables.AzCliCurrentVersion.exec(releasePage.data) as RegExpExecArray);
    return matches.groups && matches.groups['version'] ? matches.groups['version'] : '0.0.0';
}