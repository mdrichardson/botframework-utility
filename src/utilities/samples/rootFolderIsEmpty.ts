import { getWorkspaceRoot } from '../../utilities';
import fs = require('fs');
const fsP = fs.promises;

export async function rootFolderIsEmpty(): Promise<boolean> {
    const root = getWorkspaceRoot();
    const files = await fsP.readdir(root);
    return files.length === 0 ? true : false;
}