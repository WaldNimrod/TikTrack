#!/usr/bin/env node

/**
 * Visual Diff Tool - כלי להשוואה ויזואלית מפורטת
 * -------------------------------------------------
 * 
 * @description יוצר דוח HTML מפורט עם הבדלים מסומנים בצבעים
 * @usage node scripts/visual-diff.js <blueprint.html> <react-component.jsx> [output.html]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { blueprintDiff } from './blueprint-diff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate HTML report with visual diff
 */
function generateVisualDiffHTML(report, blueprintContent, reactContent) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blueprint Visual Diff Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      background: #2d2d2d;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header h1 { color: #4ec9b0; margin-bottom: 10px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .summary-card {
      background: #252526;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #4ec9b0;
    }
    .summary-card h3 {
      color: #4ec9b0;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .summary-card .number {
      font-size: 32px;
      font-weight: bold;
      color: #fff;
    }
    .comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    .side {
      background: #252526;
      padding: 20px;
      border-radius: 8px;
    }
    .side h2 {
      color: #4ec9b0;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3e3e42;
    }
    .diff-item {
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      border-left: 4px solid #3e3e42;
    }
    .diff-item.missing {
      background: #3a1f1f;
      border-left-color: #f48771;
    }
    .diff-item.extra {
      background: #1f3a1f;
      border-left-color: #89d185;
    }
    .diff-item.mismatch {
      background: #3a3a1f;
      border-left-color: #dcdcaa;
    }
    .diff-item .tag {
      color: #569cd6;
      font-weight: bold;
    }
    .diff-item .classes {
      color: #ce9178;
      font-size: 12px;
      margin-top: 5px;
    }
    .classes-list {
      margin-top: 20px;
    }
    .class-item {
      padding: 5px 10px;
      margin: 3px 0;
      border-radius: 3px;
      display: inline-block;
      margin-right: 5px;
    }
    .class-item.missing {
      background: #3a1f1f;
      color: #f48771;
    }
    .class-item.extra {
      background: #1f3a1f;
      color: #89d185;
    }
    .class-item.common {
      background: #1f1f3a;
      color: #4ec9b0;
    }
    pre {
      background: #1e1e1e;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 12px;
      border: 1px solid #3e3e42;
    }
    .code {
      font-family: 'Courier New', monospace;
      background: #1e1e1e;
      padding: 2px 6px;
      border-radius: 3px;
      color: #ce9178;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Blueprint Visual Diff Report</h1>
    <p><strong>Blueprint:</strong> ${path.basename(report.blueprint)}</p>
    <p><strong>React:</strong> ${path.basename(report.react)}</p>
    <p><strong>Timestamp:</strong> ${report.timestamp}</p>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Total Differences</h3>
        <div class="number">${report.summary.totalDifferences}</div>
      </div>
      <div class="summary-card">
        <h3>Missing Classes</h3>
        <div class="number">${report.classes.missing.length}</div>
      </div>
      <div class="summary-card">
        <h3>Extra Classes</h3>
        <div class="number">${report.classes.extra.length}</div>
      </div>
      <div class="summary-card">
        <h3>Common Classes</h3>
        <div class="number">${report.classes.common.length}</div>
      </div>
    </div>
  </div>

  <div class="comparison">
    <div class="side">
      <h2>🔍 Differences by Type</h2>
      ${report.differences.map((diff, idx) => {
        const typeClass = diff.type.includes('missing') ? 'missing' : 
                         diff.type.includes('extra') ? 'extra' : 'mismatch';
        return `
        <div class="diff-item ${typeClass}">
          <div><strong>#${idx + 1}</strong> [${diff.type.toUpperCase()}]</div>
          <div class="tag">&lt;${diff.blueprint?.tag || diff.react?.tag || 'unknown'}&gt;</div>
          <div class="classes">
            ${diff.blueprint?.classes?.length ? `Blueprint: [${diff.blueprint.classes.join(', ')}]` : ''}
            ${diff.react?.classes?.length ? `React: [${diff.react.classes.join(', ')}]` : ''}
            ${diff.missing?.length ? `Missing: [${diff.missing.join(', ')}]` : ''}
            ${diff.extra?.length ? `Extra: [${diff.extra.join(', ')}]` : ''}
          </div>
          <div style="margin-top: 5px; font-size: 11px; color: #858585;">${diff.message}</div>
        </div>`;
      }).join('')}
    </div>

    <div class="side">
      <h2>🎨 CSS Classes Comparison</h2>
      
      <div class="classes-list">
        <h3 style="color: #f48771; margin-top: 15px;">❌ Missing in React (${report.classes.missing.length})</h3>
        ${report.classes.missing.map(cls => 
          `<span class="class-item missing">${cls}</span>`
        ).join('')}
        
        <h3 style="color: #89d185; margin-top: 15px;">⚠️ Extra in React (${report.classes.extra.length})</h3>
        ${report.classes.extra.map(cls => 
          `<span class="class-item extra">${cls}</span>`
        ).join('')}
        
        <h3 style="color: #4ec9b0; margin-top: 15px;">✅ Common Classes (${report.classes.common.length})</h3>
        ${report.classes.common.map(cls => 
          `<span class="class-item common">${cls}</span>`
        ).join('')}
      </div>
    </div>
  </div>

  <div style="margin-top: 30px; background: #252526; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4ec9b0; margin-bottom: 15px;">📋 Detailed Differences</h2>
    <pre>${JSON.stringify(report.differences, null, 2)}</pre>
  </div>
</body>
</html>`;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/visual-diff.js <blueprint.html> <react-component.jsx> [output.html]');
    process.exit(1);
  }
  
  const blueprintPath = path.resolve(args[0]);
  const reactPath = path.resolve(args[1]);
  const outputPath = args[2] ? path.resolve(args[2]) : 
                     path.join(path.dirname(reactPath), 'visual-diff-report.html');
  
  // Check files exist
  if (!fs.existsSync(blueprintPath)) {
    console.error(`❌ Error: Blueprint file not found: ${blueprintPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(reactPath)) {
    console.error(`❌ Error: React file not found: ${reactPath}`);
    process.exit(1);
  }
  
  // Read files
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf-8');
  const reactContent = fs.readFileSync(reactPath, 'utf-8');
  
  // Import and use blueprint-diff
  const { compareBlueprint } = await import('./blueprint-diff.js');
  
  // Generate report (we'll need to modify blueprint-diff to return the report)
  // For now, let's create a simple version
  console.log('🔍 Generating visual diff report...');
  
  // This is a simplified version - in production, you'd call compareBlueprint
  // and use its return value
  console.log(`\n✅ Visual diff report will be saved to: ${outputPath}`);
  console.log('   (Note: This requires the full blueprint-diff implementation)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { generateVisualDiffHTML };
