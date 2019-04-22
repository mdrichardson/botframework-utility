import { Commands } from '../interfaces';

const testCommands: Commands = {
    async currentTest(): Promise<void> {
        console.log('complete');
    }
};

export { testCommands };