const fs = require('fs');
const path = require('path');

const TRADING_UI_ROOT = path.join(__dirname, '../../trading-ui');

const PAGE_FILE_MAP = {
    index: 'index.html',
    designs: 'designs.html',
    trades: 'trades.html',
    executions: 'executions.html',
    preferences: 'preferences.html',
    alerts: 'alerts.html',
    'trade-plans': 'trade_plans.html'
};

function resolvePagePath(pageName) {
    const normalized = pageName.replace(/_/g, '-');
    const fileName = PAGE_FILE_MAP[normalized];
    if (!fileName) {
        throw new Error(`Unknown page template requested: "${pageName}"`);
    }
    return path.join(TRADING_UI_ROOT, fileName);
}

function loadPageTemplate(pageName) {
    const filePath = resolvePagePath(pageName);
    return fs.readFileSync(filePath, 'utf8');
}

module.exports = {
    loadPageTemplate
};

