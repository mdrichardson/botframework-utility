import * as constants from '../../constants';
import axios from 'axios';
import fs = require('fs');
const fsP = fs.promises;
import { getWorkspaceRoot } from '..';

export default async function downloadTemplate(templateName: string): Promise<void> {
    const deploymentTemplatesFolderExists = await fs.existsSync(`${ getWorkspaceRoot() }/deploymentTemplates/`);
    if (!deploymentTemplatesFolderExists) {
        await fsP.mkdir(`${ getWorkspaceRoot() }/deploymentTemplates/`, { recursive: true });
    }
    const file = await axios.get(constants.urls[templateName]);
    await fsP.writeFile(`${ getWorkspaceRoot() }/deploymentTemplates/${ templateName }`, JSON.stringify(file.data, null, 2));
}