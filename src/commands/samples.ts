import { Commands } from "../interfaces";
import { promptForSample, getSample, openSample } from "../utilities";

const samplesCommands: Commands = {
    async downloadSample(): Promise<void> {        
        const sample = await promptForSample();
        if (sample) {
            getSample(sample);
        }
    },
    async openSample(): Promise<void> {        
        const sample = await promptForSample();
        if (sample) {
            openSample(sample);
        }
    }
};

export { samplesCommands };