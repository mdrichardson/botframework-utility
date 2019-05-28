import * as constants from '../../constants';
import { CommandOptions } from '../../interfaces';
import { getSparseCheckoutCommand, executeTerminalCommand, deleteDirectory } from '..';
import { moveFilesFromClonedSample } from './moveFilesFromClonedSample';
import { rootFolderIsEmpty } from './rootFolderIsEmpty';
import { createTempDir } from './createTempDir';

export async function getSample(sample: string): Promise<void> {
    // Check if directory is empty before we start adding files to it
    const empty = await rootFolderIsEmpty();

    const tempDir = await createTempDir((sample.split('/').pop() as string));
        
    const options: CommandOptions = {
        commandCompleteRegex: constants.regex.forDispose.GitClone,
        commandFailedRegex: constants.regex.forDispose.GitCloneFailed,
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

    await executeTerminalCommand(commands, options);

    // Ensure nothing is locked
    await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 500));
    await moveFilesFromClonedSample(sample, tempDir, empty);

    await deleteDirectory(tempDir);
}