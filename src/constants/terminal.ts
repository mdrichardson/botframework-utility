export const joins = {
    bash: ' && ',
    commandPrompt: ' & ',
    powershell: '; '
};

export const pathRegex = {
    bash: /^bash|sh$/gi,
    commandPrompt: /command|cmd/i,
    powershell: /powershell|pwsh/i,
};

export const sparseCheckoutEnding = {
    bash: ' >> .git/info/sparse-checkout',
    commandPrompt: '> .git/info/sparse-checkout',
    powershell: ' | out-file -encoding ascii .git/info/sparse-checkout',
};