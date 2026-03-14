/**
 * Blueprint Comparison Tool
 * --------------------------
 * כלי לזיהוי הבדלים בין בלופרינט HTML לבין מימוש React
 *
 * @description משווה מבנה HTML ומחלקות CSS בין בלופרינט למימוש React
 * @usage node scripts/compare-blueprint.js <blueprint-path> <react-file-path>
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract CSS classes from HTML string
 */
function extractClasses(html) {
  const classRegex = /class=["']([^"']+)["']/g;
  const classes = new Set();
  let match;

  while ((match = classRegex.exec(html)) !== null) {
    const classList = match[1].split(/\s+/);
    classList.forEach((cls) => {
      if (cls.trim()) {
        classes.add(cls.trim());
      }
    });
  }

  return Array.from(classes).sort();
}

/**
 * Extract structure (tags hierarchy) from HTML
 */
function extractStructure(html) {
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*>/g;
  const structure = [];
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const isClosing = match[0].startsWith('</');

    if (!isClosing) {
      structure.push({
        tag,
        full: match[0],
        index: match.index,
      });
    }
  }

  return structure;
}

/**
 * Extract structure from JSX (React component)
 */
function extractJSXStructure(jsxContent) {
  // Remove comments
  jsxContent = jsxContent.replace(/\/\*[\s\S]*?\*\//g, '');
  jsxContent = jsxContent.replace(/\/\/.*/g, '');

  // Extract JSX tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*>/g;
  const structure = [];
  let match;

  while ((match = tagRegex.exec(jsxContent)) !== null) {
    const tag = match[1];
    const isClosing = match[0].startsWith('</');

    if (
      !isClosing &&
      (tag.includes('div') ||
        tag.includes('main') ||
        tag.includes('section') ||
        tag.includes('header') ||
        tag.includes('footer') ||
        tag.includes('form') ||
        tag.includes('tt-'))
    ) {
      structure.push({
        tag: tag.toLowerCase(),
        full: match[0],
        index: match.index,
      });
    }
  }

  return structure;
}

/**
 * Compare two structures
 */
function compareStructures(blueprint, react) {
  const differences = [];

  // Compare length
  if (blueprint.length !== react.length) {
    differences.push({
      type: 'length',
      blueprint: blueprint.length,
      react: react.length,
      message: `Different number of elements: Blueprint has ${blueprint.length}, React has ${react.length}`,
    });
  }

  // Compare each element
  const maxLength = Math.max(blueprint.length, react.length);
  for (let i = 0; i < maxLength; i++) {
    const bp = blueprint[i];
    const rt = react[i];

    if (!bp) {
      differences.push({
        type: 'missing',
        index: i,
        react: rt?.tag,
        message: `Blueprint missing element at index ${i}, React has: ${rt?.tag}`,
      });
    } else if (!rt) {
      differences.push({
        type: 'extra',
        index: i,
        blueprint: bp.tag,
        message: `React missing element at index ${i}, Blueprint has: ${bp.tag}`,
      });
    } else if (bp.tag !== rt.tag) {
      differences.push({
        type: 'mismatch',
        index: i,
        blueprint: bp.tag,
        react: rt.tag,
        message: `Tag mismatch at index ${i}: Blueprint has <${bp.tag}>, React has <${rt.tag}>`,
      });
    }
  }

  return differences;
}

/**
 * Compare CSS classes
 */
function compareClasses(blueprintClasses, reactClasses) {
  const differences = {
    missing: [],
    extra: [],
    common: [],
  };

  blueprintClasses.forEach((cls) => {
    if (reactClasses.includes(cls)) {
      differences.common.push(cls);
    } else {
      differences.missing.push(cls);
    }
  });

  reactClasses.forEach((cls) => {
    if (!blueprintClasses.includes(cls)) {
      differences.extra.push(cls);
    }
  });

  return differences;
}

/**
 * Main comparison function
 */
function compareBlueprint(blueprintPath, reactPath) {
  console.log('🔍 Blueprint Comparison Tool\n');
  console.log(`Blueprint: ${blueprintPath}`);
  console.log(`React: ${reactPath}\n`);

  // Read files
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf-8');
  const reactContent = fs.readFileSync(reactPath, 'utf-8');

  // Extract main content from HTML (between <main> or <body>)
  const mainMatch =
    blueprintContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    blueprintContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const blueprintMain = mainMatch ? mainMatch[1] : blueprintContent;

  // Extract return statement from React
  const returnMatch = reactContent.match(/return\s*\(([\s\S]*?)\)\s*;/);
  const reactJSX = returnMatch ? returnMatch[1] : reactContent;

  // Extract structures
  const blueprintStructure = extractStructure(blueprintMain);
  const reactStructure = extractJSXStructure(reactJSX);

  // Extract classes
  const blueprintClasses = extractClasses(blueprintMain);
  const reactClasses = extractClasses(reactJSX);

  // Compare
  console.log('📊 STRUCTURE COMPARISON:');
  console.log('='.repeat(60));
  const structureDiff = compareStructures(blueprintStructure, reactStructure);

  if (structureDiff.length === 0) {
    console.log('✅ Structures match!\n');
  } else {
    console.log(`❌ Found ${structureDiff.length} differences:\n`);
    structureDiff.forEach((diff, idx) => {
      console.log(`${idx + 1}. [${diff.type.toUpperCase()}] ${diff.message}`);
      if (diff.blueprint) console.log(`   Blueprint: <${diff.blueprint}>`);
      if (diff.react) console.log(`   React: <${diff.react}>`);
      console.log('');
    });
  }

  console.log('\n📋 CSS CLASSES COMPARISON:');
  console.log('='.repeat(60));
  const classDiff = compareClasses(blueprintClasses, reactClasses);

  console.log(`\n✅ Common classes (${classDiff.common.length}):`);
  if (classDiff.common.length > 0) {
    console.log('   ' + classDiff.common.slice(0, 20).join(', '));
    if (classDiff.common.length > 20) {
      console.log(`   ... and ${classDiff.common.length - 20} more`);
    }
  }

  if (classDiff.missing.length > 0) {
    console.log(`\n❌ Missing in React (${classDiff.missing.length}):`);
    classDiff.missing.forEach((cls) => {
      console.log(`   - ${cls}`);
    });
  }

  if (classDiff.extra.length > 0) {
    console.log(`\n⚠️  Extra in React (${classDiff.extra.length}):`);
    classDiff.extra.forEach((cls) => {
      console.log(`   + ${cls}`);
    });
  }

  // Summary
  console.log('\n📈 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Structure differences: ${structureDiff.length}`);
  console.log(`Missing classes: ${classDiff.missing.length}`);
  console.log(`Extra classes: ${classDiff.extra.length}`);
  console.log(`Common classes: ${classDiff.common.length}`);

  // Generate report file
  const reportPath = path.join(
    path.dirname(reactPath),
    'blueprint-comparison-report.json',
  );
  const report = {
    blueprint: blueprintPath,
    react: reactPath,
    timestamp: new Date().toISOString(),
    structure: {
      blueprint: blueprintStructure.map((s) => s.tag),
      react: reactStructure.map((s) => s.tag),
      differences: structureDiff,
    },
    classes: {
      blueprint: blueprintClasses,
      react: reactClasses,
      comparison: classDiff,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: ${reportPath}`);
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      'Usage: node scripts/compare-blueprint.js <blueprint-path> <react-file-path>',
    );
    process.exit(1);
  }

  const blueprintPath = path.resolve(args[0]);
  const reactPath = path.resolve(args[1]);

  if (!fs.existsSync(blueprintPath)) {
    console.error(`Error: Blueprint file not found: ${blueprintPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(reactPath)) {
    console.error(`Error: React file not found: ${reactPath}`);
    process.exit(1);
  }

  compareBlueprint(blueprintPath, reactPath);
}

module.exports = {
  compareBlueprint,
  extractClasses,
  extractStructure,
  compareStructures,
  compareClasses,
};
