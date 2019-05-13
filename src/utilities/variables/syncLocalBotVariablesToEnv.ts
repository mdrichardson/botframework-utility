import { getLocalBotVariables, setEnvBotVariables } from "..";

export default async function syncLocalBotVariablesToEnv(): Promise<void> {
    const localVariables = await getLocalBotVariables();
    await setEnvBotVariables(localVariables);
}