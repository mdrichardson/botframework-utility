import { getLocalBotVariables, setEnvBotVariables } from '..';

export async function syncLocalBotVariablesToEnv(): Promise<void> {
    const localVariables = await getLocalBotVariables();
    await setEnvBotVariables(localVariables);
}