const fs = require('fs');

const manifestPath = 'trading-ui/scripts/init-system/package-manifest.js';
let content = fs.readFileSync(manifestPath, 'utf8');

// Simple replacement: add files array before scripts array
content = content.replace(
  /(loadingStrategy: '[^']+',(?:\s*\/\/[^}]*)?\s*)(scripts:)/g,
  '$1files: [],\n    $2'
);

// Write back
fs.writeFileSync(manifestPath, content);
console.log('✅ Added empty files arrays to all packages');
