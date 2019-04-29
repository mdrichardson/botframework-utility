import * as constants from '../constants';
import * as fs from 'fs';
import * as vscode from 'vscode';

import axios from 'axios';
import archiver = require('archiver');

import { getWorkspaceRoot } from './variables';

export async function getDeploymentTemplate(templateName: string): Promise<string> {
    const existingTemplate = (await vscode.workspace.findFiles(`**/${ templateName }`, null, 1))[0];
    const deploymentTemplatesFolderExists = await fs.existsSync(`${ getWorkspaceRoot() }/deploymentTemplates/`);
    if (!existingTemplate) {
        if (!deploymentTemplatesFolderExists) {
            await fs.mkdirSync(`${ getWorkspaceRoot() }/deploymentTemplates/`, { recursive: true });
        }
        const file = await axios.get(constants.urls[templateName]);
        await fs.writeFileSync(`${ getWorkspaceRoot() }/deploymentTemplates/${ templateName }`, JSON.stringify(file.data, null, 2));
    }
    return (await vscode.workspace.findFiles(`**/${ templateName }`, null, 1))[0].fsPath;
}

export async function createUpdateZip(): Promise<void> {
    vscode.window.showInformationMessage('Creating Zip File');
    const root = getWorkspaceRoot();
    await deleteUpdateZip();
    const output = fs.createWriteStream(`${ root }\\code.zip`);
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
            .glob('**', { ignore: ['**\\code.zip']})
            .finalize();
    });
}

export async function deleteUpdateZip(): Promise<void> {
    const root = getWorkspaceRoot();
    try {
        await fs.unlinkSync(`${ root }/code.zip`);
    } catch (err) {
        return;
    }
}