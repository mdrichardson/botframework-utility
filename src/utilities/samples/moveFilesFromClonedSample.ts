import { getWorkspaceRoot, renameDirectory } from '..';
import fs = require('fs');
const fsP = fs.promises;

export async function moveFilesFromClonedSample(sample: string, tempDir: string, empty: boolean): Promise<void> {
    const root = getWorkspaceRoot();

    const sampleName = sample.split('/').pop();
    const language = sample.split('/')[0];

    const oldDir = `${ tempDir }/samples/${ language }/${ sampleName }`;
    let newDir = `${ root }/${ sampleName }`;
    if (!empty) {
        newDir = root;
        const files = await fsP.readdir(oldDir);
        await Promise.all(await files.map(async (file): Promise<void> => {
            const oldPath = `${ oldDir }\\${ file }`;
            const newPath = `${ newDir }\\${ file }`;
            await renameDirectory(oldPath, newPath);
        }));
    } else {
        await renameDirectory(oldDir, newDir);
    }
}