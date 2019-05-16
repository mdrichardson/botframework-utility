import * as constants from '../../constants';
import { getWorkspaceRoot } from '..';
import fs = require('fs');
const fsP = fs.promises;

export async function deleteCodeZip(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }\\${ constants.zipFileName }`);
    } catch (err) { }
}