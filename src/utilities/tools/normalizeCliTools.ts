import FuzzyMatching = require('fuzzy-matching');
import * as constants from '../../constants';

// Ensure that cli tools from user's settings.json are normalized to constants
// Does not allow toolNames outside of micAcceptableDistance
export function normalizeCliTools(toolName: string): string {
    const minAcceptableDistance = 0.2;
    // Acceptable keys - Everything else is ignored
    const fm = new FuzzyMatching(constants.cliTools);
    const result = fm.get(toolName);
    return result.distance <= minAcceptableDistance ? result.value : null;
}