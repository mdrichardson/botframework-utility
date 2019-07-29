import * as vscode from 'vscode';
import { getSampleUrl } from './getSampleUrl';
import { Sample } from '../../interfaces';

export async function openSample(sample: Sample): Promise<void> {
    await vscode.env.openExternal(getSampleUrl(sample));
}