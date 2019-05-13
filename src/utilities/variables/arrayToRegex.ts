// Returns /^(item1|item2)$/ if includeCaratAtStart and includeDollarAtEnd are true
export function arrayToRegex(array: string[], includeCaratAtStart: boolean = true, includeDollarAtEnd: boolean = true): RegExp {
    const carat = includeCaratAtStart ? '^' : '';
    const dollar = includeDollarAtEnd ? '$' : '';
    const joinedRegionCodes = array.reduce((prev, curr): string => `${ prev }|${ curr }`);
    return new RegExp(`${ carat }(${ joinedRegionCodes })${ dollar }`);
}