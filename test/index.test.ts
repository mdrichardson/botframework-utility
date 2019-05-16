import * as constants from '../src/constants';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot, setBotVariables, promptForVariableIfNotExist, getEnvBotVariables } from '../src/utilities';
import { testNotify } from './testUtilities';


// require('./loading');
// require('./emulator');
require('./variables');
// require('./deploymentUnit');
// require('./deploymentE2E');

// suite("Quick Test", function(): void {
//     test("Should get code language if we don't know it, without prompting", async function(): Promise<void> {
//         await setBotVariables({ [constants.envVars.CodeLanguage]: undefined });
//         await promptForVariableIfNotExist(constants.envVars.CodeLanguage);
//         const variables = getEnvBotVariables();
//         assert(variables.CodeLanguage != undefined);
//     });
// });
