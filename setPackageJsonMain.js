const fs = require('fs');

const mainChange = process.argv[2];

var packageJson = require('./package.json');4

packageJson['main'] = mainChange;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 4));