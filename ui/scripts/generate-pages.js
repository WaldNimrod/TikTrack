#!/usr/bin/env node
/**
 * generate-pages.js
 * Assembles full HTML pages from page-base-template.html + .content.html files.
 * Per: TT2_PAGE_TEMPLATE_CONTRACT (POL-015), Architect Verdict, TEAM_30_TO_ARCHITECT_PAGE_TEMPLATE_PLAN_PROPOSAL.
 *
 * Usage: node ui/scripts/generate-pages.js
 * Run from project root or ui/.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UI_ROOT = path.resolve(__dirname, '..');

const TEMPLATE_PATH = path.join(
  UI_ROOT,
  'src/views/shared/page-base-template.html',
);
const MANIFEST_PATH = path.join(UI_ROOT, 'scripts/page-manifest.json');

function loadTemplate() {
  return fs.readFileSync(TEMPLATE_PATH, 'utf8');
}

function loadManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  return JSON.parse(raw);
}

function generatePage(template, page) {
  const contentPath = path.join(UI_ROOT, page.contentFile);
  if (!fs.existsSync(contentPath)) {
    throw new Error(`Content file not found: ${contentPath}`);
  }
  const content = fs.readFileSync(contentPath, 'utf8');

  const pageScripts = (page.scripts || []).join('\n');

  return template
    .replace(/\{\{PAGE_TITLE\}\}/g, page.title)
    .replace(/\{\{BODY_CLASS\}\}/g, page.bodyClass)
    .replace(/\{\{PAGE_CONFIG_SCRIPT\}\}/g, page.configPath)
    .replace(/\{\{PAGE_CONTENT\}\}/g, content)
    .replace(/\{\{PAGE_SCRIPTS\}\}/g, pageScripts);
}

function main() {
  console.log('[generate-pages] Starting...');
  console.log('[generate-pages] UI root:', UI_ROOT);

  const template = loadTemplate();
  const manifest = loadManifest();

  for (const page of manifest.pages) {
    try {
      const html = generatePage(template, page);
      const outputPath = path.join(UI_ROOT, page.outputFile);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, html, 'utf8');
      console.log('[generate-pages] Generated:', page.outputFile);
    } catch (err) {
      console.error(`[generate-pages] ERROR for ${page.id}:`, err.message);
      process.exit(1);
    }
  }

  console.log('[generate-pages] Done. Pages:', manifest.pages.length);
}

main();
