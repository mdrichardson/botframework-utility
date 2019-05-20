import * as constants from '../../constants';
import { getWorkspaceRoot } from '..';
import fs = require('fs');

export async function deleteCodeZip(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        // fs.Promises doesn't seem to work with unlink
        fs.unlink(`${ root }\\${ constants.zipFileName }`, (): void => {
            return;
        });
    } catch (err) { }
}