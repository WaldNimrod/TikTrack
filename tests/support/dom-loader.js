/**
 * DOM Loader Utilities
 * --------------------
 * Helper functions for loading TikTrack HTML templates into the Jest JSDOM environment.
 *
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TRADING_UI_ROOT = path.join(__dirname, '../../trading-ui');
const DEFAULT_BASE_URL = 'http://localhost:8080';

const PAGE_FILE_MAP = {
    index: 'index.html',
    designs: 'designs.html',
    tickers: 'tickers.html',
    trades: 'trades.html',
    executions: 'executions.html',
    preferences: 'preferences.html',
    alerts: 'alerts.html',
    notes: 'notes.html',
    'trade-plans': 'trade_plans.html',
    'trading-accounts': 'trading_accounts.html',
    'cash-flows': 'cash_flows.html',
    research: 'research.html',
    'database-display': 'db_display.html',
    'database-extra-data': 'db_extradata.html',
    'db-display': 'db_display.html',
    'db-extradata': 'db_extradata.html',
    'database_extra_data': 'db_extradata.html',
    'database_display': 'db_display.html'
};

const ensureDomEnvironment = () => {
    if (!global.document || !global.window) {
        throw new Error('DOM environment is not available. Ensure Jest is running with the jsdom environment.');
    }
};

const resolvePagePath = (pageName) => {
    const normalized = String(pageName).trim().toLowerCase().replace(/_/g, '-');
    const fileName = PAGE_FILE_MAP[normalized];
    if (!fileName) {
        throw new Error(`Unknown page template requested: "${pageName}"`);
    }
    return path.join(TRADING_UI_ROOT, fileName);
};

const readHtmlFile = (filePath) => fs.readFileSync(filePath, 'utf8');

const parseHtml = (htmlContent) => {
    const dom = new JSDOM(htmlContent);
    return {
        head: dom.window.document.head.innerHTML,
        body: dom.window.document.body.innerHTML,
        document: dom.window.document
    };
};

const resetDom = () => {
    ensureDomEnvironment();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
};

const setPageLocation = (urlPath = '/', baseUrl = DEFAULT_BASE_URL) => {
    ensureDomEnvironment();
    const url = new URL(urlPath, baseUrl);
    if (typeof window.history?.replaceState === 'function') {
        window.history.replaceState({}, '', url.toString());
    } else if (typeof window.location?.assign === 'function') {
        window.location.assign(url.toString());
    }
};

const clearStorage = () => {
    const maybeClear = (storage) => {
        if (storage && typeof storage.clear === 'function') {
            storage.clear();
        }
    };
    maybeClear(window.localStorage);
    maybeClear(window.sessionStorage);
};

const mountHtml = (htmlContent, options = {}) => {
    ensureDomEnvironment();

    const { head, body } = parseHtml(htmlContent);

    if (options.reset !== false) {
        resetDom();
    }

    document.head.innerHTML = head;
    document.body.innerHTML = body;

    if (options.url) {
        setPageLocation(options.url, options.baseUrl);
    }

    if (options.clearStorage !== false) {
        clearStorage();
    }

    return {
        document: global.document,
        window: global.window,
        html: htmlContent
    };
};

const loadPageDom = (pageName, options = {}) => {
    const normalized = String(pageName).trim().toLowerCase().replace(/_/g, '-');
    const filePath = resolvePagePath(normalized);
    const html = readHtmlFile(filePath);
    let urlPath;
    if (options.url) {
        urlPath = options.url;
    } else if (normalized === 'index') {
        urlPath = '/';
    } else {
        urlPath = `/${normalized}`;
    }

    return {
        filePath,
        html,
        ...mountHtml(html, {
            url: urlPath,
            baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
            reset: options.reset,
            clearStorage: options.clearStorage
        })
    };
};

const loadHtmlFragment = (relativePath) => {
    const filePath = path.isAbsolute(relativePath)
        ? relativePath
        : path.join(TRADING_UI_ROOT, relativePath);
    return {
        filePath,
        html: readHtmlFile(filePath)
    };
};

module.exports = {
    DEFAULT_BASE_URL,
    resolvePagePath,
    readHtmlFile,
    parseHtml,
    resetDom,
    setPageLocation,
    clearStorage,
    mountHtml,
    loadPageDom,
    loadHtmlFragment
};

