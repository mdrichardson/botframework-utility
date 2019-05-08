import * as constants from '../../constants';
import fs = require('fs');
import { getWorkspaceRoot } from '..';
const fsP = fs.promises;

export default async function deleteUpdateZip(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        await fsP.unlink(`${ root }/${ constants.zipFileName }`);
    } catch (err) {
        return;
    }
}