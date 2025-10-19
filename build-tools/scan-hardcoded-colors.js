#!/usr/bin/env node
/*
 * Hardcoded Colors Scanner
 * Scans CSS/JS/HTML for hardcoded colors and var() fallbacks
 * Outputs JSON and Markdown reports
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOTS = [
  'trading-ui/styles-new',
  'trading-ui/scripts',
  'trading-ui',
  'styles-new'
];

const EXTENSIONS = new Set(['.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.html', '.htm']);

// Exclusions (layers/files we do NOT auto-fix)
const EXCLUDE_DIR_PATTERNS = [
  /\/styles-new\/01-settings\//,
  /\/styles-new\/02-tools\//,
  /header-styles\.css$/
];
const EXCLUDE_FILE_PATTERNS = [/\/node_modules\//];

// Only-interest dynamic var fallbacks whitelist
const DYNAMIC_VAR_RE = /var\(\s*(--[\w-]+)\s*,\s*([^\)]+)\)/;
const DYNAMIC_VAR_WHITELIST = [
  /^--primary-color$/,
  /^--secondary-color$/,
  /^--success-color$/,
  /^--warning-color$/,
  /^--danger-color$/,
  /^--info-color$/,
  /^--status-[\w-]+$/,
  /^--numeric[\w-]*/,
  /^--entity-[\w-]+$/,
  /^--chart-[\w-]+$/
];

// Common CSS color keywords (subset for signal)
const NAMED_COLORS = new Set([
  'red','blue','green','orange','gray','grey','black','white','purple','yellow','teal','cyan','magenta','brown','pink','gold','silver','navy','maroon','olive','lime','aqua','fuchsia'
]);

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const FUNC_COLOR_RE = /(rgb|rgba|hsl|hsla)\([^\)]+\)/gi;
const VAR_FALLBACK_RE = /var\(\s*--[\w-]+\s*,\s*[^\)]+\)/g;
const NAMED_COLOR_RE = new RegExp(`\\b(${Array.from(NAMED_COLORS).join('|')})\\b`, 'gi');

function walkDir(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_FILE_PATTERNS.some(re => re.test(full))) continue;
      walkDir(full, files);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXTENSIONS.has(ext)) files.push(full);
    }
  }
  return files;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const findings = [];

  function record(type, value, lineIdx) {
    findings.push({
      type,
      value,
      line: lineIdx + 1,
      snippet: lines[lineIdx].trim()
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // hex
    const hexMatches = line.match(HEX_RE);
    if (hexMatches) {
      for (const m of hexMatches) record('hex', m, i);
    }

    // rgb/rgba/hsl/hsla
    const funcMatches = line.match(FUNC_COLOR_RE);
    if (funcMatches) {
      for (const m of funcMatches) record('func', m, i);
    }

    // var fallback
    const varMatches = line.match(VAR_FALLBACK_RE);
    if (varMatches) {
      for (const m of varMatches) record('var-fallback', m, i);
    }

    // named colors (avoid matching inside variable names like --green)
    // crude filter: skip if line includes '--' near the color keyword
    const namedMatches = line.match(NAMED_COLOR_RE);
    if (namedMatches) {
      for (const m of namedMatches) {
        if (line.includes('--' + m)) continue;
        record('named', m, i);
      }
    }
  }

  return findings;
}

function summarize(results) {
  const perType = {};
  const perFile = {};
  let total = 0;
  for (const r of results) {
    perType[r.type] = (perType[r.type] || 0) + 1;
    perFile[r.file] = (perFile[r.file] || 0) + 1;
    total++;
  }
  return { total, perType, perFile };
}

function suggestReplacement(file, finding) {
  const { type, value, snippet } = finding;
  // Heuristic suggestions
  if (/filter-toggle-btn|section-toggle/.test(snippet)) return 'var(--secondary-color)';
  if (/add|btn-primary|refresh-btn/.test(snippet)) return 'var(--primary-color)';
  if (/danger|error|delete/.test(snippet)) return 'var(--danger-color)';
  if (/warning|pending/.test(snippet)) return 'var(--warning-color)';
  if (/success|positive/.test(snippet)) return 'var(--success-color)';
  if (/info|link/.test(snippet)) return 'var(--info-color)';
  // Default to primary for components; tables may need specific mapping
  return 'var(--primary-color)';
}

function isExcludedLayer(file) {
  return EXCLUDE_DIR_PATTERNS.some(re => re.test(file));
}

function isDynamicVarFallback(value) {
  const m = value.match(DYNAMIC_VAR_RE);
  if (!m) return false;
  const varName = m[1];
  return DYNAMIC_VAR_WHITELIST.some(re => re.test(varName));
}

function isNeutralColor(val) {
  const v = (val || '').toLowerCase();
  return ['#fff','#ffffff','#000','#000000','#f8f9fa','#e9ecef','#dee2e6','#212529','#495057','#6c757d'].includes(v);
}

function toMarkdownReport(issues, summary) {
  const lines = [];
  lines.push('# Hardcoded Colors Report');
  lines.push('');
  lines.push(`Total findings: ${summary.total}`);
  lines.push('');
  lines.push('## By Type');
  for (const [k, v] of Object.entries(summary.perType)) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push('');
  lines.push('## Findings');
  for (const issue of issues) {
    lines.push(`- ${issue.file}:${issue.line} [${issue.type}] \`${issue.value}\``);
    lines.push(`  - snippet: ${issue.snippet}`);
    if (issue.suggestion) lines.push(`  - suggest: ${issue.suggestion}`);
  }
  return lines.join('\n');
}

async function main() {
  const roots = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROOTS;
  const files = [];
  for (const root of roots) {
    const abs = path.resolve(process.cwd(), root);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
      walkDir(abs, files);
    }
  }

  const issues = [];
  for (const f of files) {
    const rel = path.relative(process.cwd(), f);
    const excluded = isExcludedLayer(rel);
    const findings = scanFile(f);
    for (const finding of findings) {
      // Always report, but mark fixable only if safe-by-rules
      const suggestion = suggestReplacement(rel, finding);
      const fixable = (!excluded && finding.type === 'var-fallback' && isDynamicVarFallback(finding.value));
      const neutral = (finding.type === 'hex' && isNeutralColor(finding.value));
      issues.push({ file: rel, ...finding, suggestion, fixable, excludedLayer: excluded, neutral });
    }
  }

  const summary = summarize(issues);
  const outDir = path.resolve(process.cwd(), 'logs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'hardcoded_colors_report.json');
  const mdPath = path.join(outDir, 'hardcoded_colors_report.md');
  fs.writeFileSync(jsonPath, JSON.stringify({ summary, issues }, null, 2));
  fs.writeFileSync(mdPath, toMarkdownReport(issues, summary));

  console.log(`✅ Scan complete. Findings: ${summary.total}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`MD  : ${mdPath}`);
  if (summary.total === 0) process.exit(0);
  else process.exit(1);
}

main().catch(err => {
  console.error('❌ Scanner failed:', err);
  process.exit(2);
});


