import * as constants from '../../constants';
import { getVsCodeConfig } from "../variables/getVsCodeConfig";
import { handleAzCliUpdate } from '..';

export async function getToolsUpdateCommand(): Promise<string> {
    const excludedMap = {};
    (await getVsCodeConfig(constants.vsCodeConfig.names.excludeCliToolsFromUpdate) as string[])
        .forEach((tool): void => {
            excludedMap[tool] = true;
        });

    await handleAzCliUpdate(excludedMap);
    
    const toUpdate = constants.terminal.cliTools.filter((tool): boolean => !excludedMap[tool] && tool != 'az' );
    return toUpdate.length > 0 ? `npm install -g ${ toUpdate.join(' ') }` : '';
}