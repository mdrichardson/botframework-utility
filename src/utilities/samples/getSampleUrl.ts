import * as constants from '../../constants';
import * as vscode from 'vscode';
import { Sample } from '../../interfaces';

export function getSampleUrl(sample: Sample, branch?: string): vscode.Uri {
    branch = branch ? branch : 'master';
    return vscode.Uri.parse(`${ constants.samples.repoRoot }/tree/${ branch }/samples/${ sample.path }`);
}