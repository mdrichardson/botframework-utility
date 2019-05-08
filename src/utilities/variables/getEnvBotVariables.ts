import { BotVariables } from "../../interfaces";

export default function getEnvBotVariables(): BotVariables {
    const envString = process.env.BOTFRAMEWORK_UTILITY || '{}';
    return JSON.parse(envString);
}