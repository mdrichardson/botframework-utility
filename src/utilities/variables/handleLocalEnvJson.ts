import { BotVariables } from "../../interfaces";
import { normalizeEnvKeys } from ".";

export function handleLocalEnvJson(json: Partial<BotVariables>, botSettings: Partial<BotVariables>): Partial<BotVariables> {
    for (const key in json) {
        botSettings[normalizeEnvKeys(key)] = json[key];
    }
    return botSettings;
}