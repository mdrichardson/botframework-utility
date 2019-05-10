import { arrayToRegex } from "../utilities";
import { azureRegionCodes } from "./azureRegionCodes";

export const regexForValidations = {
    CodeLanguage: /^(?:Csharp|Node|Typescript)$/,
    GUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    Location: arrayToRegex(azureRegionCodes),
    MicrosoftAppPassword: /^[\w@#$%^&*\-!=\[\]{}|:‘,.?/`~();]{16,}$/,
    ResourceGroups: /^[\w\.\-)(].*[^\.]$/,
    WordsOnly: /^\w{4,}$/,
};