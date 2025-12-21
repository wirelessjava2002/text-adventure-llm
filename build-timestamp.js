const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString();
const envFilePath = path.join(__dirname, '.env.local');

// Read the existing .env.local file, if it exists
let envFileContent = '';
if (fs.existsSync(envFilePath)) {
  envFileContent = fs.readFileSync(envFilePath, 'utf-8');
}

// Parse the .env.local content into an array of lines
const envLines = envFileContent.split('\n');

// Find and update or add the REACT_APP_BUILD_DATE variable
let variableUpdated = false;
const updatedEnvLines = envLines.map((line) => {
  if (line.startsWith('REACT_APP_BUILD_DATE=')) {
    variableUpdated = true;
    return `REACT_APP_BUILD_DATE=${timestamp}`;
  }
  return line;
});

if (!variableUpdated) {
  updatedEnvLines.push(`REACT_APP_BUILD_DATE=${timestamp}`);
}

// Join the lines back together and write them to the .local file
fs.writeFileSync(envFilePath, updatedEnvLines.join('\n'));

console.log('Build timestamp generated:', timestamp);

