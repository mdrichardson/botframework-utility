// Cspell:disable

import * as assert from 'assert';
import * as constants from '../src/constants';
import { getToolsUpdateCommand, setVsCodeConfig } from '../src/utilities/index';

suite('Tools', function(): void {
    test('Should Get Appropriate Tools Update Command - No Exclusions', async function(): Promise<void> {
        await setVsCodeConfig(constants.vsCodeConfigNames.excludeCliToolsFromUpdate, []);
        const command = await getToolsUpdateCommand();
        const toUpdate = constants.cliTools;
        assert.equal(command, `npm install -g ${ toUpdate.join(' ') }`);
    });
    test('Should Get Appropriate Tools Update Command - Many Exclusions', async function(): Promise<void> {
        const notExclude = constants.cliTools.slice(0, 2);
        const exclude = constants.cliTools.slice(2);
        await setVsCodeConfig(constants.vsCodeConfigNames.excludeCliToolsFromUpdate, exclude);
        const command = await getToolsUpdateCommand();
        assert.equal(command, `npm install -g ${ notExclude.join(' ') }`);
    });
    test('Should Get Appropriate Tools Update Command - All Exclusions', async function(): Promise<void> {
        await setVsCodeConfig(constants.vsCodeConfigNames.excludeCliToolsFromUpdate, constants.cliTools);
        const command = await getToolsUpdateCommand();
        assert.equal(command, '');
    });
});