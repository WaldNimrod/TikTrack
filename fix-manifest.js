const fs = require('fs');
const path = require('path');

const manifestPath = 'trading-ui/scripts/init-system/package-manifest.js';
const content = fs.readFileSync(manifestPath, 'utf8');

// Parse the manifest - this is a simple approach
let updatedContent = content.replace(
  /scripts: \[/g,
  (match, offset, string) => {
    // Find the package definition
    const packageStart = string.lastIndexOf('  ', offset - 100);
    const packageEnd = string.indexOf('    estimatedSize:', offset);

    if (packageEnd === -1) return match;

    const packageBlock = string.substring(packageStart, packageEnd);
    const scriptsMatch = packageBlock.match(/scripts: \[(.*?)\]/s);

    if (!scriptsMatch) return match;

    // Extract file names from scripts
    const scriptsContent = scriptsMatch[1];
    const files = [];
    const scriptRegex = /'file':\s*'([^']+)'/g;
    let fileMatch;

    while ((fileMatch = scriptRegex.exec(scriptsContent)) !== null) {
      files.push(fileMatch[1]);
    }

    // Create files array
    const filesArray = files.map(f => `'${f}'`).join(',\n      ');
    const filesStr = `files: [\n      ${filesArray}\n    ],\n    scripts: [`;

    return filesStr;
  }
);

// Write back
fs.writeFileSync(manifestPath, updatedContent);
console.log('✅ Package manifest updated with files arrays');
