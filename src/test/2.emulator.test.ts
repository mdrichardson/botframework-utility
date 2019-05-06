import * as assert from 'assert';
import { getEmulatorLaunchCommand } from "../utilities/index";

suite("Emulator", function(): void {
    test("Should Create Proper Emulator Start Command", function(): void {
        const url = getEmulatorLaunchCommand('http://localhost:3978/api/messages');
        assert.equal(url, `start bfemulator://livechat.open?botUrl=http%3A%2F%2Flocalhost%3A3978%2Fapi%2Fmessages`);
    });

});