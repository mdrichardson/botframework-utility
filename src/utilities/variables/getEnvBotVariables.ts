import { BotVariables } from '../../interfaces';

export function getEnvBotVariables(): BotVariables {
    const envString = process.env.BOTFRAMEWORK_UTILITY || '{}';
    return JSON.parse(envString);
}