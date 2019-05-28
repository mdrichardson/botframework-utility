import * as vscode from 'vscode';
import * as constants from '../constants';
import { log, executeTerminalCommand, getToolsUpdateCommand } from '../utilities';
import { Commands } from '../interfaces';
import { CommandOptions } from '../interfaces/CommandOptions';

const toolsCommands: Commands = {
    async updateCliTools(): Promise<void> {        
        const command = await getToolsUpdateCommand();
        const options: CommandOptions = {
            commandCompleteRegex: constants.regex.forDispose.UpdateCliTools,
            commandFailedRegex: constants.regex.forDispose.UpdateCliToolsFailed,
            commandTitle: 'CLI Tools Update'
        };

        if (command) {
            vscode.window.showInformationMessage('Updating CLI Tools');
            log(`Updating CLI Tools.`);
            log(`**  Note: you can edit which tools to exclude from this update with this command via settings.json > botframework-utility.excludeCliToolsFromUpdate`);
            await executeTerminalCommand(command, options);
        } else {
            vscode.window.showErrorMessage('All CLI Tools Excluded from Update');
            log(`Updating CLI Tools.`);
            log(`ERROR: All CLI Tools are Excluded from Update. Edit via settings.json > botframework-utility.excludeCliToolsFromUpdate`);
        }
    }
};

export { toolsCommands };