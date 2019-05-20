import { BotVariables } from '../../interfaces';

export function getEnvBotVariables(): Partial<BotVariables> {
    const envString = (process.env.BOTFRAMEWORK_UTILITY as string);
    // For some reason, if it doesn't exist, it comes back as "undefined" and not undefined
    if (!envString || envString === "undefined") {
        return {};
    }
    return JSON.parse(envString);
}