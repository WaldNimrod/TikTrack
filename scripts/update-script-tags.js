const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.join(__dirname, '..');
const tradingUiDir = path.join(repoRoot, 'trading-ui');
const manifestPath = path.join(tradingUiDir, 'scripts/init-system/package-manifest.js');
const pageConfigsPath = path.join(tradingUiDir, 'scripts/page-initialization-configs.js');
const generatorPath = path.join(tradingUiDir, 'scripts/init-system/dev-tools/page-template-generator.js');

function loadManifest() {
  const code = fs.readFileSync(manifestPath, 'utf8');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(`${code}\nwindow.PACKAGE_MANIFEST = PACKAGE_MANIFEST;`, sandbox);
  return sandbox.window.PACKAGE_MANIFEST;
}

function loadPageConfigs() {
  const code = fs.readFileSync(pageConfigsPath, 'utf8');
  const sandbox = {
    window: {},
    console,
    document: {},
  };
  sandbox.window.Logger = { info: () => {}, warn: () => {}, error: () => {} };
  sandbox.window.CacheTTLGuard = { ensure: async () => {} };
  sandbox.window.loadDashboardData = async () => {};
  sandbox.window.loadAccountsForPreferences = async () => {};
  sandbox.window.loadDefaultColors = () => {};
  sandbox.window.renderPreferenceTypesAuditTable = async () => {};
  sandbox.window.loadTradingAccountsDataForTradingAccountsPage = async () => {};
  sandbox.window.loadAccountsData = async () => {};
  sandbox.window.initializeIndexPage = async () => {};
  sandbox.window.initPositionsPortfolio = async () => {};
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.PAGE_CONFIGS || {};
}

function loadGenerator(manifest, pageConfigs) {
  const code = fs.readFileSync(generatorPath, 'utf8');
  const sandbox = {
    window: { PACKAGE_MANIFEST: manifest, PAGE_CONFIGS: pageConfigs, showNotification: () => {} },
    console,
    document: { readyState: 'complete', addEventListener: () => {} },
    navigator: { clipboard: { writeText: async () => {} } },
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.PageTemplateGenerator || sandbox.PageTemplateGenerator;
}

const pagesToUpdate = [
  'index',
  'trades',
  'trade_plans',
  'alerts',
  'tickers',
  'trading_accounts',
  'executions',
  'data_import',
  'cash_flows',
  'notes',
  'research',
  'preferences',
  'tag-management',
  'designs',
  'dynamic-colors-display',
  'server-monitor',
  'system-management',
  'cache-management',
  'code-quality-dashboard',
  'notifications-center',
  'external-data-dashboard',
  'crud-testing-dashboard',
  'conditions-test',
  'db_display',
  'db_extradata',
  'constraints',
  'background-tasks',
  'css-management',
  'chart-management',
  'init-system-management',
  'tag-management',
];

(function main() {
  const manifest = loadManifest();
  const pageConfigs = loadPageConfigs();
  const GeneratorClass = loadGenerator(manifest, pageConfigs);
  const generator = new GeneratorClass();
  const updated = [];

  const genericEndMarker = '<!-- 🔧 For maintenance: Use PageTemplateGenerator.generateScriptTagsForPage';
  const startMarker = '<!-- ===== START SCRIPT LOADING ORDER ===== -->';

  const uniquePages = Array.from(new Set(pagesToUpdate));

  uniquePages.forEach(page => {
    const fileName = page.endsWith('.html') ? page : `${page}.html`;
    const filePath = path.join(tradingUiDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Skipping ${page} (missing ${fileName})`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
      console.warn(`⚠️ Skipping ${page} (start marker not found)`);
      return;
    }
    const blockStart = content.lastIndexOf('<!-- =============================================================== -->', startIdx);
    const maintenanceIdx = content.indexOf(genericEndMarker, startIdx);
    if (maintenanceIdx === -1) {
      console.warn(`⚠️ Skipping ${page} (maintenance marker not found)`);
      return;
    }
    const afterMaintenance = content.indexOf('\n', maintenanceIdx);
    const sliceStart = blockStart === -1 ? startIdx : blockStart;
    const sliceEnd = afterMaintenance === -1 ? maintenanceIdx : afterMaintenance;

    let newSection;
    try {
      newSection = generator.generateCompleteScriptSection(page);
    } catch (err) {
      console.error(`❌ Failed to generate script tags for ${page}:`, err.message);
      return;
    }

    const trimmedSection = newSection.trimEnd() + '\n';
    const newContent = content.slice(0, sliceStart) + trimmedSection + content.slice(sliceEnd);
    fs.writeFileSync(filePath, newContent, 'utf8');
    updated.push(fileName);
  });

  console.log(`✅ Updated script sections for ${updated.length} pages`);
  updated.forEach(page => console.log(`   - ${page}`));
})();
