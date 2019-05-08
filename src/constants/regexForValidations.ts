import { arrayToRegex } from "../utilities";
import { azureRegionCodes } from ".";

export const regexForValidations = {
    CodeLanguage: /^(?:Csharp|Node|Typescript)$/,
    GUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    Location: arrayToRegex(azureRegionCodes),
    MicrosoftAppPassword: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{16,}$/,
    ResourceGroups: /^[\w\.\-)(].*[^\.]$/,
    WordsOnly: /^\w{4,}$/,
};