/* eslint-disable */
import { Commands } from '../interfaces';
import * as vscode from 'vscode';

const testCommands: Commands = {
    async currentTest(): Promise<void> {
        const url = encodeURIComponent(`http://localhost:3978/api/messages`);
        let uri = vscode.Uri.parse(`bfemulator://livechat.open?botUrl=${url}`, true);
        vscode.env.openExternal(uri);
    }
};

export { testCommands };