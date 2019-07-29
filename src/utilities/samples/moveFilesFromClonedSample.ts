import { getWorkspaceRoot, renameDirectory } from '..';
import fs = require('fs');
import { Sample } from '../../interfaces';
const fsP = fs.promises;

export async function moveFilesFromClonedSample(sample: Sample, tempDir: string, empty: boolean): Promise<void> {
    const root = getWorkspaceRoot();

    const oldDir = `${ tempDir }/samples/${ sample.path }`;
    let newDir = `${ root }/${ sample.name }`;
    if (empty) {
        newDir = root;
        const files = await fsP.readdir(oldDir);
        await Promise.all(files.map(async (file): Promise<void> => {
            const oldPath = `${ oldDir }\\${ file }`;
            const newPath = `${ newDir }\\${ file }`;
            await renameDirectory(oldPath, newPath);
        }));
    } else {
        await renameDirectory(oldDir, newDir);
    }
}