#!/usr/bin/env node

/**
 * Fix Blueprint Differences - כלי לתיקון אוטומטי של הבדלים
 * -----------------------------------------------------------
 *
 * @description קורא את דוח ההבדלים ומציע תיקונים אוטומטיים
 * @usage node scripts/fix-blueprint-diff.js <diff-report.json>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate fix suggestions
 */
function generateFixSuggestions(report) {
  const suggestions = [];

  report.differences.forEach((diff) => {
    switch (diff.type) {
      case 'missing_in_react':
        suggestions.push({
          type: 'add',
          index: diff.index,
          element: diff.blueprint,
          suggestion: `Add <${diff.blueprint.tag}> with classes="${diff.blueprint.classes.join(' ')}" at index ${diff.index}`,
        });
        break;

      case 'tag_mismatch':
        suggestions.push({
          type: 'replace',
          index: diff.index,
          from: diff.react.tag,
          to: diff.blueprint.tag,
          suggestion: `Replace <${diff.react.tag}> with <${diff.blueprint.tag}> at index ${diff.index}`,
        });
        break;

      case 'class_difference':
        if (diff.missing.length > 0) {
          suggestions.push({
            type: 'add_classes',
            index: diff.index,
            tag: diff.tag,
            classes: diff.missing,
            suggestion: `Add classes "${diff.missing.join(' ')}" to <${diff.tag}> at index ${diff.index}`,
          });
        }
        if (diff.extra.length > 0) {
          suggestions.push({
            type: 'remove_classes',
            index: diff.index,
            tag: diff.tag,
            classes: diff.extra,
            suggestion: `Remove classes "${diff.extra.join(' ')}" from <${diff.tag}> at index ${diff.index}`,
          });
        }
        break;
    }
  });

  return suggestions;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      'Usage: node scripts/fix-blueprint-diff.js <diff-report.json>',
    );
    process.exit(1);
  }

  const reportPath = path.resolve(args[0]);

  if (!fs.existsSync(reportPath)) {
    console.error(`❌ Error: Report file not found: ${reportPath}`);
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const suggestions = generateFixSuggestions(report);

  console.log('\n' + '='.repeat(80));
  console.log('🔧 FIX SUGGESTIONS');
  console.log('='.repeat(80));
  console.log(`\nTotal suggestions: ${suggestions.length}\n`);

  suggestions.forEach((suggestion, idx) => {
    console.log(`${idx + 1}. [${suggestion.type.toUpperCase()}]`);
    console.log(`   ${suggestion.suggestion}`);
    if (suggestion.element) {
      console.log(
        `   Element: <${suggestion.element.tag}> classes=[${suggestion.element.classes.join(', ')}]`,
      );
    }
    if (suggestion.classes) {
      console.log(`   Classes: [${suggestion.classes.join(', ')}]`);
    }
    console.log('');
  });

  // Save suggestions
  const suggestionsPath = reportPath.replace('.json', '-fix-suggestions.json');
  fs.writeFileSync(
    suggestionsPath,
    JSON.stringify(
      {
        report: reportPath,
        suggestions: suggestions,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log(`💾 Suggestions saved to: ${suggestionsPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateFixSuggestions };
