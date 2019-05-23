// Cspell:disable

import * as assert from 'assert';
import * as constants from '../src/constants';
import { getToolsUpdateCommand, setVsCodeConfig, getCurrentAzCliVersion, getLatestAzCliVersion } from '../src/utilities/index';
import Axios, { AxiosResponse } from 'axios';

suite('Tools', function(): void {
    test("All Website Constants Should Return 200 Status", async function(): Promise<void> {
        for (const key in constants.websites) {
            const response = (await Axios.get(constants.websites[key]) as AxiosResponse);
            assert.equal(response.status, 200);
        }
    });
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
    test("Should get the current version of AZ CLI", async function(): Promise<void> {
        const timeout = 10 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);
        
        const version = await getCurrentAzCliVersion();
        assert(typeof version === 'string');
        assert(version !== '0.0.0');
    });
    test("Should get the latest version of AZ CLI", async function(): Promise<void> {
        const timeout = 5 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const version = await getLatestAzCliVersion();
        assert(typeof version === 'string');
        assert(version !== '0.0.0');
    });
});