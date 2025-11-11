/**
 * Accessibility Baseline – WCAG 2.1 A/AA smoke tests
 * --------------------------------------------------
 *
 * These tests run axe-core on the main HTML shells to make sure
 * we do not introduce serious / critical violations while we iterate.
 * The test environment already provides a global JSDOM document via Jest.
 * We strip script tags so that we only analyse the rendered structure.
 */

const fs = require('fs');
const path = require('path');
const axeCore = require('axe-core');

const TARGET_PAGES = [
    { id: 'alerts', file: 'alerts.html' },
    { id: 'cash_flows', file: 'cash_flows.html' },
    { id: 'data_import', file: 'data_import.html' },
    { id: 'executions', file: 'executions.html' },
    { id: 'notes', file: 'notes.html' },
    { id: 'trade_plans', file: 'trade_plans.html' },
    { id: 'trades', file: 'trades.html' },
    { id: 'trading_accounts', file: 'trading_accounts.html' },
    { id: 'tickers', file: 'tickers.html' }
];

const ALLOWED_RULE_IDS = new Set(['button-name', 'html-has-lang', 'select-name']);

/**
 * Remove script tags – axe only needs the markup for baseline checks.
 * @param {string} html
 * @returns {string}
 */
function stripScripts(html) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Load HTML document into the shared JSDOM instance.
 * @param {string} sanitizedHtml
 */
function mountHTML(sanitizedHtml) {
    document.documentElement.innerHTML = '<head></head><body></body>';
    const container = document.createElement('div');
    container.setAttribute('data-testid', 'a11y-root');
    container.innerHTML = sanitizedHtml;
    document.body.appendChild(container);
}

/**
 * Run axe with WCAG 2.1 A/AA rules.
 * We focus on serious / critical impact issues to keep the signal high.
 */
async function runAxeAnalysis() {
    axeCore.configure({
        reporter: 'v2'
    });

    const results = await axeCore.run(document, {
        runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa']
        },
        rules: {
            // Colour contrast is handled in the dedicated design token work.
            'color-contrast': { enabled: false }
        }
    });

    const relevantViolations = results.violations.filter((violation) => {
        return (
            ['serious', 'critical'].includes(violation.impact)
        );
    });

    const actionable = relevantViolations.filter((violation) => !ALLOWED_RULE_IDS.has(violation.id));
    const allowed = relevantViolations.filter((violation) => ALLOWED_RULE_IDS.has(violation.id));

    return { actionable, allowed };
}

describe('Accessibility baseline', () => {
    beforeEach(() => {
        // reset DOM between runs
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    TARGET_PAGES.forEach(({ id, file }) => {
        it(`has no serious WCAG violations – ${id}`, async () => {
            const htmlPath = path.join(__dirname, '../../../trading-ui', file);
            const rawHtml = fs.readFileSync(htmlPath, 'utf8');
            const sanitized = stripScripts(rawHtml);

            mountHTML(sanitized);

            const { actionable, allowed } = await runAxeAnalysis();

            if (allowed.length > 0) {
                const formattedAllowed = allowed.map((violation) => {
                    const nodes = violation.nodes
                        .map((node) => node.target.join(' '))
                        .slice(0, 5)
                        .join(', ');
                    return `${violation.id} (${violation.impact}) → ${violation.help} [${nodes}]`;
                });
                // eslint-disable-next-line no-console
                console.warn(`[a11y][known-issue] ${id}: ${formattedAllowed.join(' | ')}`);
            }

            if (actionable.length > 0) {
                const formatted = actionable.map((violation) => {
                    const nodes = violation.nodes
                        .map((node) => node.target.join(' '))
                        .slice(0, 5)
                        .join(', ');
                    return `${violation.id} (${violation.impact}) → ${violation.help} [${nodes}]`;
                });
                throw new Error(
                    `Detected accessibility violations on ${id}:\n${formatted.join('\n')}`
                );
            }

            expect(actionable).toHaveLength(0);
        });
    });
});

