import { Commands } from '../interfaces';

import * as constants from '../constants';
import { promptForVariableIfNotExist } from '../utilities';

const testCommands: Commands = {
    async currentTest(): Promise<void> {
        await promptForVariableIfNotExist(constants.envVars.Location, constants.envVarPrompts.Location, constants.regexForValidations.Location);
    }
};

export { testCommands };