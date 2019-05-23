import fs = require('fs');
import { log } from '..';
const fsP = fs.promises;

export async function renameDirectory(oldPath: fs.PathLike, newPath: fs.PathLike): Promise<void> {
    try {
        await fsP.rename(oldPath, newPath);
    } catch (err) {
        // Try to wait for file unlock
        log(`Unable to rename => ${ newPath }. Waiting 2 seconds before trying again`);
        try {
            await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 2000));
            await fsP.rename(oldPath, newPath);
        } catch (err) {
            log(`Unable to rename => ${ newPath }.`);
            await fsP.rename(oldPath, `${ newPath }_unableToRename`);
        }
    }
}