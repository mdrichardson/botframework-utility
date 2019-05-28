// Cspell:disable

import * as assert from 'assert';
import * as constants from '../src/constants';
import { getToolsUpdateCommand, setVsCodeConfig, getCurrentAzCliVersion, getLatestAzCliVersion } from '../src/utilities/index';
import Axios, { AxiosResponse } from 'axios';

suite('Tools', function(): void {
    test("All Website Constants Should Return 200 Status", async function(): Promise<void> {
        for (const key in constants.urls.downloadTemplates) {
            const response = (await Axios.get(constants.urls.downloadTemplates[key]) as AxiosResponse);
            assert.equal(response.status, 200);
        }
        const otherUrls = [
            constants.urls.azCliDownload,
        ];
        await Promise.all(otherUrls.map(async (url): Promise<void> => {
            const response = (await Axios.get(url) as AxiosResponse);
            assert.equal(response.status, 200);
        }));
    });
    test('Should Get Appropriate Tools Update Command - No Exclusions', async function(): Promise<void> {
        const timeout = 12 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        await setVsCodeConfig(constants.vsCodeConfig.names.excludeCliToolsFromUpdate, []);
        const command = await getToolsUpdateCommand();
        const toUpdate = constants.terminal.cliTools.slice(1);
        assert.equal(command, `npm install -g ${ toUpdate.join(' ') }`);
    });
    test('Should Get Appropriate Tools Update Command - Many Exclusions', async function(): Promise<void> {
        const timeout = 12 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const notExclude = constants.terminal.cliTools.slice(1, 3);
        const exclude = constants.terminal.cliTools.slice(3);
        await setVsCodeConfig(constants.vsCodeConfig.names.excludeCliToolsFromUpdate, exclude);
        const command = await getToolsUpdateCommand();
        assert.equal(command, `npm install -g ${ notExclude.join(' ') }`);
    });
    test('Should Get Appropriate Tools Update Command - All Exclusions', async function(): Promise<void> {
        const timeout = 12 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);
        
        await setVsCodeConfig(constants.vsCodeConfig.names.excludeCliToolsFromUpdate, constants.terminal.cliTools);
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