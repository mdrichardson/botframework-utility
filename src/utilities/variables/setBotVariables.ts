import { BotVariables } from "../../interfaces";
import { getEnvBotVariables, normalizeEnvKeys, setLocalBotVariables, setEnvBotVariables } from "..";

export default async function setBotVariables(variablesToAdd: Partial<BotVariables>): Promise<void> {
    // Add new variables to vsCode env
    const currentBotVariables = await getEnvBotVariables();
    let changes = 0;
    for (const key in variablesToAdd) {
        const normalizedKey = normalizeEnvKeys(key);
        if (currentBotVariables[normalizedKey] != variablesToAdd[key]) {
            changes += 1;
            currentBotVariables[normalizedKey] = variablesToAdd[key] || '';
        }        
    }
    if (changes > 0) {
        await setLocalBotVariables(currentBotVariables);
        await setEnvBotVariables(currentBotVariables);
    }
}