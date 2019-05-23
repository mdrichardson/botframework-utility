import * as constants from '../../constants';
import { CommandOptions } from '../../interfaces';
import { getSparseCheckoutCommand, executeTerminalCommand, getWorkspaceRoot, deleteDirectory } from '..';
import fs = require('fs');
import { moveFilesFromClonedSample } from './moveFilesFromClonedSample';
import { rootFolderIsEmpty } from './rootFolderIsEmpty';
const fsP = fs.promises;

export async function getSample(sample: string): Promise<void> {
    // Make temp dir
    const root = getWorkspaceRoot();
    const date = new Date();
    const tempString = `${ date.toDateString() }${ date.getHours() }${ date.getMinutes() }`.replace(/ /g, '');
    let tempDir = `${ root }\\${ sample.split('/').pop() }_${ tempString }`;
    await fsP.mkdir(tempDir);
        
    const options: CommandOptions = {
        commandCompleteRegex: constants.regexForDispose.GitClone,
        commandFailedRegex: constants.regexForDispose.GitCloneFailed,
        commandTitle: 'Get Sample',
        isTest: true,
        timeout: 10 * 1000,
    };

    const sparseCheckoutCommand = await getSparseCheckoutCommand(`samples/${ sample }`);

    let commands = await [
        `cd "${ tempDir }"`,
        `git init`,
        `git remote add origin ${ constants.samples.repoRoot }`,
        `git config core.sparsecheckout true`,
        sparseCheckoutCommand,
        `git pull --depth=1 origin master`
    ];

    await executeTerminalCommand(commands.join(constants.terminal.join), options);

    const empty = await rootFolderIsEmpty();

    await moveFilesFromClonedSample(sample, tempDir, empty);

    await deleteDirectory(tempDir);
}