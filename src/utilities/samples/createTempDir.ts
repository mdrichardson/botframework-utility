import fs = require('fs');
import { getWorkspaceRoot } from '..';
const fsP = fs.promises;

export async function createTempDir(dirName: string): Promise<string> {
    const root = getWorkspaceRoot();
    const date = new Date();
    const tempString = `${ date.toDateString() }${ date.getHours() }${ date.getMinutes() }`.replace(/ /g, '');
    let tempDir = `${ root }\\${ dirName }_${ tempString }`;
    await fsP.mkdir(tempDir);
    return tempDir;
}