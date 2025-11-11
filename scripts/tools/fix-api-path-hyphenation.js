#!/usr/bin/env node

'use strict';

/**
 * API Path Hyphenation Fixer
 * --------------------------
 * Scans the codebase for legacy `/api/...` paths that still use underscores,
 * replaces the ones that have a verified hyphenated route on the backend,
 * and logs the remaining occurrences for manual follow-up.
 *
 * Safe replacements are derived automatically from backend Blueprints whose
 * `url_prefix` already uses hyphenated segments. Any match without a confirmed
 * hyphenated counterpart is reported for manual handling.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const BACKEND_ROUTES_DIR = path.join(PROJECT_ROOT, 'Backend', 'routes', 'api');

const SCAN_DIRECTORIES = [
  'Backend',
  'trading-ui/scripts',
  'trading-ui/styles',
  'trading-ui',
  'scripts'
];

const TEXT_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts',
  '.py',
  '.json',
  '.html',
  '.css', '.scss',
  '.md',
  '.txt'
]);

const EXCLUDE_PATTERNS = [
  /(^|\/)\.git\//,
  /(^|\/)node_modules\//,
  /(^|\/)__pycache__\//,
  /(^|\/)archive\//,
  /(^|\/)backup\//,
  /\.backup/i,
  /\.bak$/i,
  /\.log$/i,
  /\.sqlite$/i,
  /\.db$/i,
  /\.png$/i,
  /\.jpg$/i,
  /\.svg$/i,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.lock$/,
  /\.gz$/,
  /\.zip$/
];

const REPORT_DIR = path.join(PROJECT_ROOT, 'scripts', 'reports');
const REPORT_PATH = path.join(REPORT_DIR, `api-path-hyphenation-report-${Date.now()}.json`);

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!ext) {
    return false;
  }
  return TEXT_EXTENSIONS.has(ext);
}

function readFileSafe(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFileSafe(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function gatherBackendHyphenRoutes() {
  const routeMap = new Map(); // legacySegment -> hyphenSegment

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (path.extname(entry.name) !== '.py') {
        continue;
      }
      const content = readFileSafe(fullPath);
      const regex = /url_prefix\s*=\s*['"]\/api\/([a-z0-9\-\/]+)['"]/gi;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const hyphenPath = match[1];
        if (!hyphenPath.includes('-')) {
          continue;
        }
        const legacyPath = hyphenPath.replace(/-/g, '_');
        if (legacyPath === hyphenPath) {
          continue;
        }
        if (!routeMap.has(legacyPath)) {
          routeMap.set(legacyPath, hyphenPath);
        }
      }
    }
  }

  walk(BACKEND_ROUTES_DIR);
  return routeMap;
}

function walkDirectory(dir, visitor) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(PROJECT_ROOT, fullPath);

    if (shouldExclude(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      walkDirectory(fullPath, visitor);
    } else if (entry.isFile()) {
      visitor(fullPath, relativePath);
    }
  }
}

function computeLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

function ensureReportDirectory() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
}

function main() {
  console.log('🔍 Gathering backend hyphenated routes...');
  const safeRouteMap = gatherBackendHyphenRoutes();

  if (safeRouteMap.size === 0) {
    console.log('⚠️  No hyphenated backend routes detected. Nothing to replace.');
    return;
  }

  console.log(`✅ Identified ${safeRouteMap.size} hyphenated backend routes.`);

  const safeReplacements = [];
  const manualFindings = [];

  for (const dir of SCAN_DIRECTORIES) {
    const absoluteDir = path.join(PROJECT_ROOT, dir);
    if (!fs.existsSync(absoluteDir)) {
      continue;
    }

    walkDirectory(absoluteDir, (absolutePath, relativePath) => {
      if (!isTextFile(absolutePath)) {
        return;
      }

      let content = readFileSafe(absolutePath);
      let modified = false;
      const fileReplacements = new Map(); // `${from}->${to}` -> count
      const allowAutomaticWrite = !relativePath.startsWith('Backend/routes/api/');

      const regex = /\/api\/([a-z0-9_]+)(?=[/'"?])/gi;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const segment = match[1];
        if (!segment.includes('_')) {
          continue;
        }

        const replacement = safeRouteMap.get(segment);
        const index = match.index;
        const lineNumber = computeLineNumber(content, index);

        if (replacement && allowAutomaticWrite) {
          const fromPath = `/api/${segment}`;
          const toPath = `/api/${replacement}`;
          content = content.replace(fromPath, toPath);
          modified = true;
          const key = `${fromPath} -> ${toPath}`;
          fileReplacements.set(key, (fileReplacements.get(key) || 0) + 1);
        } else {
          const contextStart = Math.max(0, index - 60);
          const contextEnd = Math.min(content.length, index + 60);
          manualFindings.push({
            file: relativePath,
            line: lineNumber,
            legacyPath: `/api/${segment}`,
            context: content.slice(contextStart, contextEnd)
          });
        }
      }

      if (modified) {
        writeFileSafe(absolutePath, content);
        safeReplacements.push({
          file: relativePath,
          replacements: Array.from(fileReplacements.entries()).map(([key, count]) => ({
            change: key,
            count
          }))
        });
      }
    });
  }

  ensureReportDirectory();

  const reportPayload = {
    generatedAt: new Date().toISOString(),
    safeRouteMap: Object.fromEntries(safeRouteMap),
    safeReplacements,
    manualFindings
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(reportPayload, null, 2), 'utf8');

  console.log('\n📄 Report generated at:', REPORT_PATH);
  console.log(`✅ Files auto-updated: ${safeReplacements.length}`);
  console.log(`⚠️  Findings requiring manual review: ${manualFindings.length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error during execution:', error);
    process.exit(1);
  }
}


