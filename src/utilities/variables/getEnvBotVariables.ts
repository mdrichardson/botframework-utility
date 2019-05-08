import { BotVariables } from "../../interfaces";

export default async function getEnvBotVariables(): Promise<Partial<BotVariables>> {
    const envString = process.env.BOTFRAMEWORK_UTILITY || '{}';
    return JSON.parse(envString);
}