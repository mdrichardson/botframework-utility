import * as constants from '../../constants';
import { getVsCodeConfig } from "../variables/getVsCodeConfig";
import { normalizeCliTools } from './normalizeCliTools';

export async function getToolsUpdateCommand(): Promise<string> {
    const excludedMap = (await getVsCodeConfig(constants.vsCodeConfigNames.excludeCliToolsFromUpdate) as string[])
        .map((excludedTool): void => {
            const normalizedTool = normalizeCliTools(excludedTool);
            if (normalizedTool) {
                excludedMap[excludedTool] = true;
            }
        });
    
    const toUpdate = constants.cliTools.filter((tool): boolean => !excludedMap[tool] );
    return toUpdate.length > 0 ? `npm install -g ${ toUpdate.join(' ') }` : '';
}