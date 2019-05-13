import * as constants from '../../constants';
import { getWorkspaceRoot } from '..';
import fs = require('fs');
const fsP = fs.promises;

export async function deleteUpdateZip(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }/${ constants.zipFileName }`);
    } catch (err) {
        return;
    }
}