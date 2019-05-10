import * as constants from '../src/constants';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;

require('./loading');
require('./emulator');
require('./variables');
require('./deploymentUnit');
// require('./deploymentE2E');

// suite("Quick Test", function(): void {
//     test("Should Load Variables from Appsettings.json", async function(): Promise<void> {
//         await deleteEnvFiles();
//         const root = getWorkspaceRoot();
//         const data = JSON.stringify({ testVar: 'test' });
//         await fsP.writeFile(`${ root }\\appsettings.json`, data);
//         const result = await getLocalBotVariables();
//         assert.equal(result['testVar'], 'test');
//     });
// });
