import fs = require('fs');
const fsP = fs.promises;

export async function deleteDirectory(path: string): Promise<void> {
    if (fs.existsSync(path)) {
        const files = await fsP.readdir(path);
        await Promise.all(files.map(async (file): Promise<void> => {
            const delPath = `${ path }/${ file }`;
            if ((await fsP.lstat(delPath)).isDirectory()) {
                await deleteDirectory(delPath);
            } else {
                await fsP.unlink(delPath);
            }
        }));
        await fsP.rmdir(path);
    }
}