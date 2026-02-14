#!/usr/bin/env node
/**
 * validate-pages.js
 * Validates HTML pages against TT2_PAGE_TEMPLATE_CONTRACT (POL-015 v1.1).
 * Rejects any page that violates DOM structure or CSS loading order.
 *
 * POL-015 v1.1: No Auth exceptions — all pages (including Auth via React SPA) must comply.
 * Index.html = Unified Shell for React routes (/, /login, /register, /reset-password, etc.)
 *
 * Usage: node ui/scripts/validate-pages.js
 * Exit: 0 = PASS, 1 = violations found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UI_ROOT = path.resolve(__dirname, '..');

// CSS links in mandatory order (per CSS_LOADING_ORDER.md)
const CSS_ORDER = [
  'cdn.jsdelivr.net/npm/@picocss/pico',
  'phoenix-base.css',
  'phoenix-components.css',
  'phoenix-header.css',
  'D15_DASHBOARD_STYLES.css',
  'phoenix-modal.css',
];

// All pages per POL-015 v1.1 (Non-Auth + Auth shell)
// Template pages (financial, management, data) MUST include headerLoader.js — אלמנט ראש דף
const PAGES_CONFIG = [
  { path: 'index.html', profile: 'spa' },
  { path: 'src/views/financial/tradingAccounts/trading_accounts.html', profile: 'template' },
  { path: 'src/views/financial/brokersFees/brokers_fees.html', profile: 'template' },
  { path: 'src/views/financial/cashFlows/cash_flows.html', profile: 'template' },
  { path: 'src/views/management/tickers/tickers.html', profile: 'template' },
  { path: 'src/views/management/userTicker/user_tickers.html', profile: 'template' },
  { path: 'src/views/data/dataDashboard/data_dashboard.html', profile: 'template' },
];

function validateFile(filePath, profile) {
  const fullPath = path.join(UI_ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    return [{ file: filePath, line: 0, rule: 'FILE_NOT_FOUND', msg: `File does not exist: ${filePath}` }];
  }

  const html = fs.readFileSync(fullPath, 'utf8');
  const violations = [];

  // 1. RTL (all profiles)
  if (!/lang="he"/.test(html)) {
    violations.push({ file: filePath, line: 2, rule: 'RTL', msg: 'Missing lang="he"' });
  }
  if (!/dir="rtl"/.test(html)) {
    violations.push({ file: filePath, line: 2, rule: 'RTL', msg: 'Missing dir="rtl"' });
  }

  // 2. Favicon (all profiles)
  if (!/rel="icon".*favicon/i.test(html)) {
    violations.push({ file: filePath, line: 0, rule: 'FAVICON', msg: 'Missing favicon link' });
  }

  // 3. DOM structure: page-wrapper > page-container > main (all profiles)
  if (!/<div[^>]*class="[^"]*page-wrapper/.test(html)) {
    violations.push({ file: filePath, line: 0, rule: 'DOM', msg: 'Missing page-wrapper' });
  }
  if (!/<div[^>]*class="[^"]*page-container/.test(html)) {
    violations.push({ file: filePath, line: 0, rule: 'DOM', msg: 'Missing page-container' });
  }
  if (!/<main[\s>]/.test(html)) {
    violations.push({ file: filePath, line: 0, rule: 'DOM', msg: 'Missing main' });
  }

  // POL-015: Header Loader — אלמנט ראש דף חובה לכל עמוד (מלבד Auth)
  const templateProfiles = ['template', 'financial'];
  if (templateProfiles.includes(profile) && !/headerLoader\.js/.test(html)) {
    violations.push({ file: filePath, line: 0, rule: 'HEADER', msg: 'Missing headerLoader.js — אלמנט ראש דף חובה' });
  }

  if (profile === 'spa') {
    // SPA (index.html): Unified Shell for React/Auth. CSS via main.jsx; layout via headerLoader path.
    if (!/id="root"/.test(html)) {
      violations.push({ file: filePath, line: 0, rule: 'SPA', msg: 'Missing #root for React mount' });
    }
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>|href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/gi;
    const cssLinks = [];
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      cssLinks.push((m[1] || m[2] || '').trim());
    }
    if (!cssLinks.some(href => href && (href.includes('picocss') || href.includes('pico.min')))) {
      violations.push({ file: filePath, line: 0, rule: 'CSS', msg: 'SPA must load Pico CSS in HTML' });
    }
  } else if (profile === 'template' || profile === 'financial') {
    // template/financial: full validation
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>|href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/gi;
    const cssLinks = [];
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      cssLinks.push((m[1] || m[2] || '').trim());
    }
    let lastIdx = -1;
    for (let i = 0; i < CSS_ORDER.length; i++) {
      const needle = CSS_ORDER[i];
      const idx = cssLinks.findIndex(href => href && href.includes(needle));
      if (idx === -1) {
        violations.push({ file: filePath, line: 0, rule: 'CSS_ORDER', msg: `Missing CSS: ${needle}` });
      } else if (idx <= lastIdx) {
        violations.push({ file: filePath, line: 0, rule: 'CSS_ORDER', msg: `Wrong order: ${needle}` });
      } else {
        lastIdx = idx;
      }
    }

    const pageConfigIdx = html.indexOf('PageConfig');
    const uaiIdx = html.indexOf('UnifiedAppInit');
    const wrapperIdx = html.indexOf('page-wrapper');
    if (pageConfigIdx === -1) {
      violations.push({ file: filePath, line: 0, rule: 'UAI', msg: 'Missing PageConfig script' });
    }
    if (uaiIdx === -1) {
      violations.push({ file: filePath, line: 0, rule: 'UAI', msg: 'Missing UnifiedAppInit script' });
    }
    if (pageConfigIdx !== -1 && uaiIdx !== -1 && pageConfigIdx > uaiIdx) {
      violations.push({ file: filePath, line: 0, rule: 'UAI', msg: 'PageConfig must load before UnifiedAppInit' });
    }
    if (uaiIdx !== -1 && wrapperIdx !== -1 && uaiIdx > wrapperIdx) {
      violations.push({ file: filePath, line: 0, rule: 'UAI', msg: 'UnifiedAppInit must load before page-wrapper' });
    }

    if (!/<tt-container[\s>]/.test(html)) {
      violations.push({ file: filePath, line: 0, rule: 'DOM', msg: 'Missing tt-container' });
    }
    const ttSectionCount = (html.match(/<tt-section[\s>]/g) || []).length;
    if (ttSectionCount < 1) {
      violations.push({ file: filePath, line: 0, rule: 'TT_CONTAINER', msg: 'tt-container must contain at least one tt-section' });
    }
    if (ttSectionCount >= 1) {
      if (!/index-section__header/.test(html)) {
        violations.push({ file: filePath, line: 0, rule: 'TT_SECTION', msg: 'Each tt-section must have index-section__header' });
      }
      if (!/index-section__body/.test(html)) {
        violations.push({ file: filePath, line: 0, rule: 'TT_SECTION', msg: 'Each tt-section must have index-section__body' });
      }
      if (!/<tt-section-row[\s>]/.test(html)) {
        violations.push({ file: filePath, line: 0, rule: 'TT_SECTION', msg: 'Each tt-section must contain tt-section-row' });
      }
    }
  }

  return violations;
}

function main() {
  console.log('[validate-pages] Validating all pages per POL-015 v1.1 (including Auth shell)...\n');

  let totalViolations = 0;

  for (const { path: filePath, profile } of PAGES_CONFIG) {
    const violations = validateFile(filePath, profile);
    if (violations.length === 0) {
      console.log(`[PASS] ${filePath}`);
    } else {
      console.log(`[FAIL] ${filePath}`);
      for (const v of violations) {
        console.log(`  - [${v.rule}] ${v.msg}`);
        totalViolations++;
      }
    }
  }

  console.log('');
  if (totalViolations === 0) {
    console.log('[validate-pages] PASS — All pages (including Auth) comply with POL-015 v1.1.');
    process.exit(0);
  } else {
    console.log(`[validate-pages] FAIL — ${totalViolations} violation(s) found.`);
    process.exit(1);
  }
}

main();
