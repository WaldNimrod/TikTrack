const fs = require('fs');

const manifestPath = 'trading-ui/scripts/init-system/package-manifest.js';
let content = fs.readFileSync(manifestPath, 'utf8');

// Function to extract files from scripts array
function extractFilesFromScripts(scriptsText) {
  const files = [];
  // Match all 'file': 'filename.js' patterns
  const fileRegex = /'file':\s*'([^']+)'/g;
  let match;
  while ((match = fileRegex.exec(scriptsText)) !== null) {
    files.push(match[1]);
  }
  return files;
}

// Process each package
const packageRegex = /(\/\/[^\n]*\n\s+)([a-zA-Z_-]+):\s*\{([^}]+)\}/g;
content = content.replace(packageRegex, (match, comment, pkgName, pkgContent) => {
  // Skip if already has files array
  if (pkgContent.includes('files:')) {
    return match;
  }

  // Extract scripts content
  const scriptsMatch = pkgContent.match(/scripts:\s*\[([^\]]*)\]/);
  if (!scriptsMatch) {
    return match;
  }

  const files = extractFilesFromScripts(scriptsMatch[1]);
  if (files.length === 0) {
    return match;
  }

  // Find where to insert files array (before scripts)
  const scriptsIndex = pkgContent.indexOf('scripts:');
  const beforeScripts = pkgContent.substring(0, scriptsIndex);
  const afterScripts = pkgContent.substring(scriptsIndex);

  // Create files array
  const filesStr = files.map(f => `      '${f}'`).join(',\n');
  const filesArray = `files: [\n${filesStr}\n    ],\n    `;

  return comment + pkgName + ': {' + beforeScripts + filesArray + afterScripts + '}';
});

// Write back
fs.writeFileSync(manifestPath, content);
console.log('✅ Package manifest updated with files arrays');
