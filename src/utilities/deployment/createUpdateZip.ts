import * as vscode from 'vscode';
import * as constants from '../../constants';
import archiver = require('archiver');
import fs = require('fs');
import { getWorkspaceRoot, deleteUpdateZip } from '..';

export async function createUpdateZip(): Promise<void> {
    vscode.window.showInformationMessage('Creating Zip File');
    const root = getWorkspaceRoot();
    await deleteUpdateZip();
    const output = fs.createWriteStream(`${ root }\\${ constants.zipFileName }`);
    const archive = archiver('zip', { zlib: { level: 1 }});

    let dots = 0;
    let updateCount = 0;
    const skipEveryXUpdates = 30;
    const maxDots = 15;

    vscode.window.setStatusBarMessage(`Zipping${ ' '.repeat(maxDots) }`);

    return new Promise((resolve, reject): void => {
        output
            .on('error', (err): void => reject(err))
            .on('finish', (): void => {
                vscode.window.showInformationMessage('Done Creating Zip File');
                vscode.window.setStatusBarMessage('');
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