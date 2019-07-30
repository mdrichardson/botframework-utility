// Cspell:disable

import * as assert from 'assert';
import * as constants from '../src/constants';
import * as vscode from 'vscode';
import { createTempDir, deleteDirectory, getSparseCheckoutCommand, promptForSample, getWorkspaceRoot, renameDirectory, rootFolderIsEmpty, getSample, openSample } from '../src/utilities';
import { makeNestedTestDir, disposeAllTerminals } from './testUtilities';
import sinon = require('sinon');
import fs = require('fs');
import { Sample } from '../src/interfaces';
import { getSampleUrl } from '../src/utilities/samples/getSampleUrl';
const fsP = fs.promises;

suite('Samples', function(): void {
    suiteTeardown(async (): Promise<void> => {
        await disposeAllTerminals();
    });

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
    test("Should Not Throw When Deleting Directory", async function(): Promise<void> {
        const root = getWorkspaceRoot();

        try {
            await deleteDirectory(`${ root }\\thereIs\\NoWay\\IExist`);
        } catch(err) {
            assert.fail(err);
        }
    });
    test("Should Get Appropriate Sparse Checkout Command and Defaults to Bash", async function(): Promise<void> {
        this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');

        const path = 'test';

        const commandPowershell = await getSparseCheckoutCommand(path);

        Object.defineProperty(process, 'platform', { value: 'darwin' });
        const commandBash = await getSparseCheckoutCommand(path);

        const regexStub = sinon.stub(constants.regex.terminalPaths.bash, 'test');
        regexStub.returns(false);

        Object.defineProperty(process, 'platform', { value: 'linux' });
        const commandDefault = await getSparseCheckoutCommand(path);


        Object.defineProperty(process, 'platform', this.originalPlatform);

        assert.equal(commandPowershell, `echo "${ path }/*"${ constants.terminal.sparseCheckoutEnding.powershell }`);
        assert.equal(commandBash, `echo "${ path }/*"${ constants.terminal.sparseCheckoutEnding.bash }`);
        assert.equal(commandDefault, `echo "${ path }/*"${ constants.terminal.sparseCheckoutEnding.bash }`);
    });
    test("Should Prompt User For Samples and Return Path to Sample", async function(): Promise<void> {
        const promptStub = sinon.stub(vscode.window, 'showQuickPick');
        const language = (constants.samples.cSharpDir as unknown as vscode.QuickPickItem);
        const name = (constants.samples.cSharpSamples['01.console-echo'] as unknown as vscode.QuickPickItem);
        promptStub.onCall(0).resolves(language);
        promptStub.onCall(1).resolves(name);
        const sample = (await promptForSample() as Sample);
        assert.equal(sample.language, language);
        assert.equal(sample.name, name);
    });
    test("Should Not Throw if User Prompted for Sample and Dismisses", async function(): Promise<void> {
        const promptStub = sinon.stub(vscode.window, 'showQuickPick');
        promptStub.resolves(undefined);

        try {
            await promptForSample();
        } catch (err) {
            assert.fail(err);
        }
    });
    test("Should Not Throw if User Prompted for Sample and Dismisses After Choosing Language", async function(): Promise<void> {
        const promptStub = sinon.stub(vscode.window, 'showQuickPick');
        const language = (constants.samples.cSharpDir as unknown as vscode.QuickPickItem);
        promptStub.onCall(0).resolves(language);
        promptStub.onCall(1).resolves(undefined);
        promptStub.onCall(2).resolves(undefined);

        try {
            await promptForSample();
        } catch (err) {
            assert.fail(err);
        }
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
    test("Should Wait for Folder Unlock if Rename Fails, Change Name if Fails Again", async function(): Promise<void> {
        this.timeout(5000);

        const root = getWorkspaceRoot();

        await deleteDirectory(`${ root }\\TestDir`);
        await deleteDirectory(`${ root }\\TestDir_NEW`);
        await deleteDirectory(`${ root }\\TestDir_NEW_unableToRename`);

        const oldPath = await makeNestedTestDir();
        const newPath = `${ root }\\testDir_NEW`;

        const fsStub = sinon.stub(fs.promises, 'rename');
        fsStub.onCall(0).throws(new Error('First Throw'));
        fsStub.onCall(1).throws(new Error('Second Throw'));
        fsStub.callThrough();

        await renameDirectory(oldPath, newPath);

        assert(!fs.existsSync(oldPath));
        assert(fs.existsSync(`${ newPath }_unableToRename`));

        await deleteDirectory(`${ newPath }_unableToRename`);
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
        this.timeout(10 * 1000 * 99);

        const promptStub = sinon.stub(vscode.window, "showQuickPick");
        const language = (constants.samples.cSharpDir as unknown as vscode.QuickPickItem);
        const name = (constants.samples.cSharpSamples["01.console-echo"] as unknown as vscode.QuickPickItem);
        promptStub.onCall(0).resolves(language);
        promptStub.onCall(1).resolves(name);
        const sample = (await promptForSample() as Sample);

        await getSample(sample);

        const root = getWorkspaceRoot();
        const samplePath = `${ root }\\${ sample.name }`;
        assert(fs.existsSync(samplePath));

        await deleteDirectory(samplePath);
    });
    test("Should Put a Sample in a Root Folder When Dir Is Empty", async function(): Promise<void> {
        this.timeout(100 * 1000);

        const promptStub = sinon.stub(vscode.window, "showQuickPick");
        const language = (constants.samples.cSharpDir as unknown as vscode.QuickPickItem);
        const name = (constants.samples.cSharpSamples["01.console-echo"] as unknown as vscode.QuickPickItem);
        promptStub.onCall(0).resolves(language);
        promptStub.onCall(1).resolves(name);
        const sample = (await promptForSample() as Sample);

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

        await getSample(sample);

        assert(fs.existsSync(`${ fakeEmpty }\\EchoBot.cs`));

        await deleteDirectory(fakeEmpty);
    });
    test("Should Get an Appropriate Sample URL", async function(): Promise<void> {
        const sample = new Sample('csharp_dotnetcore', 'testName');
        const sampleUrl = getSampleUrl(sample);
        const fakeBranchSampleUrl = getSampleUrl(sample, 'fakeBranch');
        assert.equal(sampleUrl.path, vscode.Uri.parse(`${ constants.samples.repoRoot }/tree/master/samples/${ sample.path }`).path);
        assert.equal(fakeBranchSampleUrl.path, vscode.Uri.parse(`${ constants.samples.repoRoot }/tree/fakeBranch/samples/${ sample.path }`).path);
    });
    test("Should Open a Sample in Browser without Throwing", async function(): Promise<void> {
        const sample = new Sample('csharp_dotnetcore', 'testName');

        try {
            openSample(sample);
        } catch (err) {
            assert.fail(err);
        }
    });
});