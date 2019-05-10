import * as constants from '../src/constants';
import assert = require("assert");
import fs = require('fs');
const fsP = fs.promises;
import mocha = require('mocha');
import { getWorkspaceRoot } from '../src/utilities';
import { testNotify } from './testUtilities';


// require('./loading');
// require('./emulator');
// require('./variables');
// require('./deploymentUnit');
require('./deploymentE2E');

// suite("Quick Test", function(): void {
//     test("Should Load Variables from Appsettings.json", async function(): Promise<void> {
//         assert(false);
//     });
//     teardown(async function(): Promise<void> {
//         if (this.currentTest.state === 'failed') {
//             const root = getWorkspaceRoot();
//             const saveLocation = `${ root }\\${ this.currentTest.title }.txt`;
//             try {
//                 await fsP.copyFile(`${ root }\\${ constants.testing.TerminalOutput }`, saveLocation);
//                 testNotify(`Saved terminal error to: ${ saveLocation }`);
//             } catch (err) { }
//         }
//     });
// });
