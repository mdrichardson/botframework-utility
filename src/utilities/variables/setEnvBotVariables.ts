import { BotVariables } from '../../interfaces';

export async function setEnvBotVariables(fullBotVariables: Partial<BotVariables>): Promise<void> {
    process.env.BOTFRAMEWORK_UTILITY = JSON.stringify(fullBotVariables);
}