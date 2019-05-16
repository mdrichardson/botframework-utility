import * as vscode from 'vscode';
import * as constants from '../../constants';
import archiver = require('archiver');
import fs = require('fs');
import { getWorkspaceRoot, deleteCodeZip } from '..';

export async function createCodeZip(): Promise<void> {
    vscode.window.showInformationMessage('Creating Zip File');
    const root = getWorkspaceRoot();
    await deleteCodeZip();
    const output = fs.createWriteStream(`${ root }\\${ constants.zipFileName }`);
    const archive = archiver('zip', { zlib: { level: 1 }});

    let dots = 0;
    let updateCount = 0;
    const skipEveryXUpdates = 30;
    const maxDots = 15;

    vscode.window.setStatusBarMessage(`Zipping${ ' '.repeat(maxDots) }`);

    return new Promise((resolve, reject): void => {
        output
            .on('error', (err): void => {
                /* istanbul ignore next: rare */
                reject(err);
            })
            .on('finish', async (): Promise<void> => {
                vscode.window.showInformationMessage('Done Creating Zip File');
                vscode.window.setStatusBarMessage('');
                // Need to wait for the file to unlock
                await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 500));
                resolve();
            });
        archive.pipe(output);
        archive
            .on('progress', (): void => {
                if (updateCount % skipEveryXUpdates === 0) {
                    vscode.window.setStatusBarMessage(`Zipping${ '.'.repeat(dots) }${ ' '.repeat(maxDots - dots) }`);
                    dots = dots < maxDots ? dots + 1 : 0;
                }
                updateCount++;
            })
            .glob('**', { ignore: [`**\\${ constants.zipFileName }`]})
            .finalize();
    });
}