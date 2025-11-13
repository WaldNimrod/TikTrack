const { loadPageTemplate } = require('../utils/page-test-utils');

describe('Trades Page Template', () => {
    let tradesHtml;

    beforeAll(() => {
        tradesHtml = loadPageTemplate('trades');
    });

    test('contains unified header integration', () => {
        expect(tradesHtml).toContain('id="unified-header"');
    });

    test('renders main trades table container', () => {
        expect(tradesHtml).toContain('data-table-type="trades"');
        expect(tradesHtml).toContain('id="tradesTable"');
    });

    test('includes trades summary elements', () => {
        expect(tradesHtml).toContain('id="tradesCount"');
        expect(tradesHtml).toContain('id="openTrades"');
        expect(tradesHtml).toContain('id="totalTrades"');
    });
});

describe('Executions Page Template', () => {
    let executionsHtml;

    beforeAll(() => {
        executionsHtml = loadPageTemplate('executions');
    });

    test('contains unified header integration', () => {
        expect(executionsHtml).toContain('id="unified-header"');
    });

    test('renders main executions table container', () => {
        expect(executionsHtml).toContain('data-table-type="executions"');
        expect(executionsHtml).toContain('id="executionsTable"');
    });

    test('includes executions summary elements', () => {
        expect(executionsHtml).toContain('id="executionsCount"');
        expect(executionsHtml).toContain('id="totalExecutions"');
        expect(executionsHtml).toContain('id="totalBuyExecutions"');
    });
});

