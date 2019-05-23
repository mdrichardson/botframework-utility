import * as constants from '../../constants';
import { getWorkspaceRoot } from '..';
import fs = require('fs');
const fsP = fs.promises;

export async function deleteCodeZip(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        // fs.Promises doesn't seem to work with unlink
        await fsP.unlink(`${ root }\\${ constants.zipFileName }`);
    } catch (err) { }
}