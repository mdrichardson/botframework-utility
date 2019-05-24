// Cspell:disable

import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { createTempDir, deleteDirectory, getSparseCheckoutCommand, promptForSample, getWorkspaceRoot, renameDirectory, rootFolderIsEmpty, getSample } from '../src/utilities';
import { makeNestedTestDir } from './testUtilities';
import sinon = require('sinon');
import fs = require('fs');
const fsP = fs.promises;

suite('Samples', function(): void {
    teardown((): void => {
        sinon.restore();
    });
    test("Should Create an Appropriate Temporary Directory", async function(): Promise<void> {
        const tempDir = await createTempDir('test');

        try {
            assert(/test_.{5,}/.test((tempDir.split('\\').pop() as string)));
            assert(fs.existsSync(tempDir));
            await deleteDirectory(tempDir);
        } catch (err) {
            await deleteDirectory(tempDir);
            assert.fail(err);
        }
    });
    test("Should Recursively Delete a Directory", async function(): Promise<void> {
        const path = await makeNestedTestDir();

        await deleteDirectory(path);
        assert(!fs.existsSync(path));
    });
    test("Should Get Appropriate Sparse Checkout Command", async function(): Promise<void> {
        const path = 'test';
        const command = await getSparseCheckoutCommand(path);
        assert.equal(command, `echo "${ path }/*"${ constants.terminal.sparseCheckoutEnding.powershell }`);
    });
    test("Should Prompt User For Samples and Return Path to Sample", async function(): Promise<void> {
        const promptStub = sinon.stub(vscode.window, "showQuickPick");
        const language = (constants.samples.cSharpDir as unknown as vscode.QuickPickItem);
        const sample = (constants.samples.cSharpSamples["01.console-echo"] as unknown as vscode.QuickPickItem);
        promptStub.onCall(0).resolves(language);
        promptStub.onCall(1).resolves(sample);
        const path = await promptForSample();
        assert.equal(path, `${ language }/${ sample }`);
    });
    test("Should Appropriately Rename Folders", async function(): Promise<void> {
        const root = getWorkspaceRoot();
        const oldPath = await makeNestedTestDir();
        const newPath = `${ root }\\testDir_NEW`;

        await renameDirectory(oldPath, newPath);

        assert(!fs.existsSync(oldPath));
        assert(fs.existsSync(newPath));

        await deleteDirectory(newPath);
    });
    test("Should Appropriately Return Whether or not Root Dir is Empty", async function(): Promise<void> {
        const empty = await rootFolderIsEmpty();
        assert.equal(empty, false);

        const getRootStub = sinon.stub(fsP, 'readdir');
        getRootStub.resolves([]);
        const stubEmpty = await rootFolderIsEmpty();
        assert.equal(stubEmpty, true);
    });
    test("Should Put a Sample in a New Folder When Dir Not Empty", async function(): Promise<void> {
        const timeout = 10 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const promptStub = sinon.stub(vscode.window, "showQuickPick");
        const language = (constants.samples.cSharpDir as unknown as vscode.QuickPickItem);
        const sample = (constants.samples.cSharpSamples["01.console-echo"] as unknown as vscode.QuickPickItem);
        promptStub.onCall(0).resolves(language);
        promptStub.onCall(1).resolves(sample);
        const path = (await promptForSample() as string);

        await getSample(path);

        const root = getWorkspaceRoot();
        const samplePath = `${ root }\\${ sample }`;
        assert(fs.existsSync(samplePath));

        await deleteDirectory(samplePath);
    });
    test("Should Put a Sample in a Root Folder When Dir Is Empty", async function(): Promise<void> {
        const timeout = 100 * 1000;
        this.timeout(timeout);
        this.slow(timeout * 0.95);

        const promptStub = sinon.stub(vscode.window, "showQuickPick");
        const language = (constants.samples.cSharpDir as unknown as vscode.QuickPickItem);
        const sample = (constants.samples.cSharpSamples["01.console-echo"] as unknown as vscode.QuickPickItem);
        promptStub.onCall(0).resolves(language);
        promptStub.onCall(1).resolves(sample);
        const path = (await promptForSample() as string);

        const root = getWorkspaceRoot();
        const fakeEmpty = `${ root }\\fakeEmpty`;
        if (fs.existsSync(fakeEmpty)) {
            await deleteDirectory(fakeEmpty);
        }
        await fsP.mkdir(fakeEmpty);

        // Fake vscode into using new empty root folder
        const fakeEmptyFolder: vscode.WorkspaceFolder = {
            index: 0,
            name: 'fakeEmpty',
            uri: vscode.Uri.parse(fakeEmpty),
        };
        sinon.replaceGetter(vscode.workspace, 'workspaceFolders', (): vscode.WorkspaceFolder[] => [fakeEmptyFolder]);

        await getSample(path);

        assert(fs.existsSync(`${ fakeEmpty }\\EchoBot.cs`));

        await deleteDirectory(fakeEmpty);
    });
});