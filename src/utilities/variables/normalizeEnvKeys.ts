import FuzzyMatching = require('fuzzy-matching');
import * as constants from '../../constants';

// Ensure that keys retrieved from .env and appsettings.json are normalized to constants
// Allows use of the passed in key if can't be normalized
export function normalizeEnvKeys(key: string): string {
    const minAcceptableDistance = 0.3; // appId vs. MicrosoftAppId = 0.36 distance
    // Acceptable keys - Everything else is ignored
    const fm = new FuzzyMatching(Object.keys(constants.variables.botVariables));
    const result = fm.get(key);
    return result.distance >= minAcceptableDistance ? result.value : key;
}