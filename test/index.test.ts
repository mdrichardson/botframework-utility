import * as constants from '../src/constants';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot } from '../src/utilities';
import { testNotify } from './testUtilities';


require('./loading');
// require('./emulator');
// require('./variables');
// require('./deploymentUnit');
// require('./deploymentE2E');

// suite("Quick Test", function(): void {
//     test("Should Load Extension Without Throwing", async function(): Promise<void> {
//         assert.ok({});
//     });
// });
