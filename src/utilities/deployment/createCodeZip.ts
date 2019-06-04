import * as vscode from 'vscode';
import * as constants from '../../constants';
import archiver = require('archiver');
import fs = require('fs');
import { getWorkspaceRoot, deleteCodeZip } from '..';

export async function createCodeZip(): Promise<void> {
    vscode.window.showInformationMessage('Creating Zip File');
    const root = getWorkspaceRoot();
    await deleteCodeZip();
    // Give time for it to delete since it doesn't seem to do so immediately
    await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 3000));
    const output = fs.createWriteStream(`${ root }\\${ constants.files.zip }`);
    const archive = archiver('zip', { zlib: { level: 1 }});

    let dots = 0;
    let updateCount = 0;
    const skipEveryXUpdates = 100;
    const maxDots = 3;

    vscode.window.setStatusBarMessage(`Zipping${ ' '.repeat(maxDots) }`, 500);

    return new Promise((resolve, reject): void => {
        output
            .on('error', (err): void => {
                reject(err);
            })
            .on('finish', async (): Promise<void> => {
                vscode.window.showInformationMessage('Done Creating Zip File');
                resolve();
            });
        archive.pipe(output);
        archive
            .on('progress', (): void => {
                if (updateCount % skipEveryXUpdates === 0) {
                    vscode.window.setStatusBarMessage(`Zipping${ '.'.repeat(dots) }${ ' '.repeat(maxDots - dots) }`, 500);
                    dots = dots < maxDots ? dots + 1 : 0;
                }
                updateCount++;
            })
            .glob(`**`, { cwd: root, ignore: [`**\\${ constants.files.zip }`], })
            .finalize();
    });
}