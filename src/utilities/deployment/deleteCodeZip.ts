import * as constants from '../../constants';
import { getWorkspaceRoot } from '..';
import fs = require('fs');
const fsP = fs.promises;

export async function deleteCodeZip(): Promise<void> {
    const root = getWorkspaceRoot();
    const zip = `${ root }\\${ constants.files.zip }`;
    if (fs.existsSync(zip)) {
        await fsP.unlink(`${ root }\\${ constants.files.zip }`);
    }
}