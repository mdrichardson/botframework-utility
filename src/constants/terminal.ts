export const cliTools = [
    "az", 
    "botdispatch", 
    "botskills", 
    "chatdown", 
    // "dialogtracker", 
    // "dialogschema", 
    // "dialoglint", 
    "msbot", 
    "ludown", 
    "luis-apis", 
    "luisgen", 
    "qnamaker" 
];

export const joins = {
    bash: ' && ',
    commandPrompt: ' & ',
    powershell: '; '
};

export const sparseCheckoutEnding = {
    bash: ' >> .git/info/sparse-checkout',
    commandPrompt: '> .git/info/sparse-checkout',
    powershell: ' | out-file -encoding ascii .git/info/sparse-checkout',
};

export const platformPaths = {
    linux: '/bin/bash',
    osx: 'sh',
    windows: 'c:\\Windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe',
};