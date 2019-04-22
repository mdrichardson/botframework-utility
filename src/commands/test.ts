/* eslint-disable */
import { Commands } from '../interfaces';

import * as constants from '../constants';
import { promptForVariableIfNotExist } from '../utilities';

const testCommands: Commands = {
    async currentTest(): Promise<void> {
        return;
    }
};

export { testCommands };