#!/usr/bin/env node

/**
 * Blueprint Diff Tool - כלי לזיהוי הבדלים בין בלופרינט למימוש
 * -------------------------------------------------------------
 * 
 * @description כלי מתקדם לזיהוי הבדלים במבנה HTML, מחלקות CSS, ומאפיינים
 * @usage node scripts/blueprint-diff.js <blueprint.html> <react-component.jsx>
 * 
 * Output:
 * - דוח מפורט של כל ההבדלים
 * - רשימת מחלקות CSS חסרות/מיותרות
 * - רשימת אלמנטים חסרים/מיותרים
 * - המלצות לתיקון
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract all CSS classes from content
 */
function extractAllClasses(content) {
  const classes = new Set();
  
  // Match class="..." or className="..."
  const regex = /(?:class|className)=["']([^"']+)["']/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const classList = match[1].split(/\s+/).filter(c => c.trim());
    classList.forEach(cls => classes.add(cls.trim()));
  }
  
  return Array.from(classes).sort();
}

/**
 * Extract element structure with classes
 */
function extractElementStructure(content, isJSX = false) {
  const elements = [];
  // Updated regex to handle JSX tags like <tt-container>, <tt-section>, etc.
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  let match;
  
  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    
    // Extract classes
    const classMatch = attrs.match(/(?:class|className)=["']([^"']+)["']/);
    const classes = classMatch ? classMatch[1].split(/\s+/).filter(c => c.trim()) : [];
    
    // Extract id
    const idMatch = attrs.match(/id=["']([^"']+)["']/);
    const id = idMatch ? idMatch[1] : null;
    
    // Extract data attributes
    const dataAttrs = {};
    const dataRegex = /data-(\w+)=["']([^"']+)["']/g;
    let dataMatch;
    while ((dataMatch = dataRegex.exec(attrs)) !== null) {
      dataAttrs[dataMatch[1]] = dataMatch[2];
    }
    
    elements.push({
      tag,
      classes: classes.sort(),
      id,
      dataAttrs,
      full: match[0],
      index: match.index
    });
  }
  
  return elements;
}

/**
 * Extract main content area (between <main> or <body>)
 */
function extractMainContent(htmlContent) {
  // Try to find <main> first
  const mainMatch = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    return mainMatch[1];
  }
  
  // Fallback to <body>
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1];
  }
  
  return htmlContent;
}

/**
 * Extract JSX return content
 */
function extractJSXReturn(jsxContent) {
  // Find return statement
  const returnMatch = jsxContent.match(/return\s*\(([\s\S]*?)\)\s*;/);
  if (returnMatch) {
    return returnMatch[1];
  }
  
  // Try arrow function return
  const arrowMatch = jsxContent.match(/=>\s*\(([\s\S]*?)\)\s*;/);
  if (arrowMatch) {
    return arrowMatch[1];
  }
  
  return jsxContent;
}

/**
 * Compare element structures
 */
function compareElements(blueprintElements, reactElements) {
  const differences = [];
  const maxLength = Math.max(blueprintElements.length, reactElements.length);
  
  for (let i = 0; i < maxLength; i++) {
    const bp = blueprintElements[i];
    const rt = reactElements[i];
    
    if (!bp) {
      differences.push({
        type: 'extra_in_react',
        index: i,
        react: {
          tag: rt?.tag,
          classes: rt?.classes || []
        },
        message: `Element at index ${i} exists in React but not in Blueprint: <${rt?.tag}>`
      });
      continue;
    }
    
    if (!rt) {
      differences.push({
        type: 'missing_in_react',
        index: i,
        blueprint: {
          tag: bp.tag,
          classes: bp.classes || []
        },
        message: `Element at index ${i} exists in Blueprint but missing in React: <${bp.tag}>`
      });
      continue;
    }
    
    // Compare tags
    if (bp.tag !== rt.tag) {
      differences.push({
        type: 'tag_mismatch',
        index: i,
        blueprint: { tag: bp.tag, classes: bp.classes },
        react: { tag: rt.tag, classes: rt.classes },
        message: `Tag mismatch at index ${i}: Blueprint has <${bp.tag}>, React has <${rt.tag}>`
      });
    }
    
    // Compare classes
    const bpClasses = new Set(bp.classes || []);
    const rtClasses = new Set(rt.classes || []);
    
    const missingClasses = [...bpClasses].filter(c => !rtClasses.has(c));
    const extraClasses = [...rtClasses].filter(c => !bpClasses.has(c));
    
    if (missingClasses.length > 0 || extraClasses.length > 0) {
      differences.push({
        type: 'class_difference',
        index: i,
        tag: bp.tag,
        missing: missingClasses,
        extra: extraClasses,
        message: `Class differences in <${bp.tag}> at index ${i}: Missing: [${missingClasses.join(', ')}], Extra: [${extraClasses.join(', ')}]`
      });
    }
    
    // Compare IDs
    if (bp.id && bp.id !== rt.id) {
      differences.push({
        type: 'id_mismatch',
        index: i,
        tag: bp.tag,
        blueprint: bp.id,
        react: rt.id,
        message: `ID mismatch in <${bp.tag}> at index ${i}: Blueprint has "${bp.id}", React has "${rt.id || 'none'}"`
      });
    }
  }
  
  return differences;
}

/**
 * Generate detailed report
 */
function generateReport(blueprintPath, reactPath, differences, blueprintClasses, reactClasses) {
  const report = {
    timestamp: new Date().toISOString(),
    blueprint: blueprintPath,
    react: reactPath,
    summary: {
      totalDifferences: differences.length,
      byType: {}
    },
    differences: differences,
    classes: {
      blueprint: blueprintClasses,
      react: reactClasses,
      missing: blueprintClasses.filter(c => !reactClasses.includes(c)),
      extra: reactClasses.filter(c => !blueprintClasses.includes(c)),
      common: blueprintClasses.filter(c => reactClasses.includes(c))
    }
  };
  
  // Count by type
  differences.forEach(diff => {
    report.summary.byType[diff.type] = (report.summary.byType[diff.type] || 0) + 1;
  });
  
  return report;
}

/**
 * Print formatted report
 */
function printReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 BLUEPRINT DIFF REPORT');
  console.log('='.repeat(80));
  console.log(`\nBlueprint: ${path.basename(report.blueprint)}`);
  console.log(`React: ${path.basename(report.react)}`);
  console.log(`Timestamp: ${report.timestamp}\n`);
  
  // Summary
  console.log('📈 SUMMARY:');
  console.log('-'.repeat(80));
  console.log(`Total Differences: ${report.summary.totalDifferences}`);
  console.log('\nBy Type:');
  Object.entries(report.summary.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Classes
  console.log('\n🎨 CSS CLASSES:');
  console.log('-'.repeat(80));
  console.log(`Blueprint classes: ${report.classes.blueprint.length}`);
  console.log(`React classes: ${report.classes.react.length}`);
  console.log(`Common classes: ${report.classes.common.length}`);
  console.log(`Missing in React: ${report.classes.missing.length}`);
  console.log(`Extra in React: ${report.classes.extra.length}`);
  
  if (report.classes.missing.length > 0) {
    console.log('\n❌ Missing Classes:');
    report.classes.missing.forEach(cls => {
      console.log(`   - ${cls}`);
    });
  }
  
  if (report.classes.extra.length > 0) {
    console.log('\n⚠️  Extra Classes:');
    report.classes.extra.forEach(cls => {
      console.log(`   + ${cls}`);
    });
  }
  
  // Differences
  if (report.differences.length > 0) {
    console.log('\n🔍 DETAILED DIFFERENCES:');
    console.log('-'.repeat(80));
    
    report.differences.forEach((diff, idx) => {
      console.log(`\n${idx + 1}. [${diff.type.toUpperCase()}]`);
      console.log(`   ${diff.message}`);
      
      if (diff.blueprint) {
        console.log(`   Blueprint: <${diff.blueprint.tag}> classes=[${diff.blueprint.classes.join(', ')}]`);
      }
      if (diff.react) {
        console.log(`   React: <${diff.react.tag}> classes=[${diff.react.classes.join(', ')}]`);
      }
      if (diff.missing && diff.missing.length > 0) {
        console.log(`   Missing classes: [${diff.missing.join(', ')}]`);
      }
      if (diff.extra && diff.extra.length > 0) {
        console.log(`   Extra classes: [${diff.extra.join(', ')}]`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(80));
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/blueprint-diff.js <blueprint.html> <react-component.jsx>');
    console.error('\nExample:');
    console.error('  node scripts/blueprint-diff.js _COMMUNICATION/team_01/team_01_staging/D15_LOGIN.html ui/src/cubes/identity/components/auth/LoginForm.jsx');
    process.exit(1);
  }
  
  const blueprintPath = path.resolve(args[0]);
  const reactPath = path.resolve(args[1]);
  
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
  
  // Extract main content
  const blueprintMain = extractMainContent(blueprintContent);
  const reactJSX = extractJSXReturn(reactContent);
  
  // Extract structures
  const blueprintElements = extractElementStructure(blueprintMain, false);
  const reactElements = extractElementStructure(reactJSX, true);
  
  // Extract classes
  const blueprintClasses = extractAllClasses(blueprintMain);
  const reactClasses = extractAllClasses(reactJSX);
  
  // Compare
  const differences = compareElements(blueprintElements, reactElements);
  
  // Generate report
  const report = generateReport(blueprintPath, reactPath, differences, blueprintClasses, reactClasses);
  
  // Print report
  printReport(report);
  
  // Save JSON report
  const reportPath = path.join(path.dirname(reactPath), 'blueprint-diff-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed JSON report saved to: ${reportPath}`);
  
  // Exit with error code if differences found
  if (differences.length > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  extractAllClasses,
  extractElementStructure,
  compareElements,
  generateReport
};
