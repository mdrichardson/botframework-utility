import { Commands } from "../interfaces";
import { promptForSample, getSample } from "../utilities";

const samplesCommands: Commands = {
    async getSample(): Promise<void> {        
        const sample = await promptForSample();
        if (sample) {
            getSample(sample);
        }
    }
};

export { samplesCommands };