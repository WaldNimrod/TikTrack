const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const tradingUiDir = path.join(repoRoot, 'trading-ui');
const pages = [
  'index','trades','trade_plans','alerts','tickers','trading_accounts','executions','data_import',
  'cash_flows','notes','research','preferences','tag-management','designs','dynamic-colors-display',
  'server-monitor','system-management','cache-management','code-quality-dashboard','notifications-center',
  'external-data-dashboard','crud-testing-dashboard','conditions-test','db_display','db_extradata',
  'constraints','background-tasks','css-management','chart-management','init-system-management'
];

const results = [];
let passCount = 0;

pages.forEach(page => {
  const file = page.endsWith('.html') ? page : `${page}.html`;
  const filePath = path.join(tradingUiDir, file);
  if (!fs.existsSync(filePath)) {
    results.push({ page, status: 'missing-file' });
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const hasBootstrap = content.includes('bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js');
  const hasStart = content.includes('<!-- ===== START SCRIPT LOADING ORDER ===== -->');
  const hasMaintenance = content.includes('<!-- 🔧 For maintenance: Use PageTemplateGenerator.generateScriptTagsForPage');
  const status = hasBootstrap && hasStart && hasMaintenance ? 'ok' : 'fail';
  if (status === 'ok') passCount++;
  results.push({ page, status, hasBootstrap, hasStart, hasMaintenance });
});

console.log(`Verified ${results.length} pages. Success: ${passCount}, Failures: ${results.length - passCount}`);
results.forEach(r => {
  if (r.status !== 'ok') {
    console.log(`⚠️ ${r.page}: bootstrap=${r.hasBootstrap}, startMarker=${r.hasStart}, maintenance=${r.hasMaintenance}`);
  }
});

const reportLines = results.map(r => `| ${r.page} | ${r.status === 'ok' ? '✅' : '⚠️'} |`);
const reportPath = path.join(repoRoot, 'documentation/05-REPORTS/TOOLTIP_STANDARDIZATION_QA.md');
const markdown = `# דו"ח בדיקות - טולטיפים וטעינת סקריפטים

**תאריך:** ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}

## סיכום
- נבדקו ${results.length} עמודים מתוך רשימת היעד
- ${passCount} עמודים הותאמו בהצלחה
- ${results.length - passCount} עמודים זקוקים לבדיקת המשך (אם קיימים)

## סטטוס עמודים
| עמוד | סטטוס |
| --- | --- |
${reportLines.join('\n')}
`;
fs.writeFileSync(reportPath, markdown, 'utf8');
console.log(`Report saved to documentation/05-REPORTS/TOOLTIP_STANDARDIZATION_QA.md`);
