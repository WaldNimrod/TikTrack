const { loadPageTemplate } = require('../utils/page-test-utils');

describe('Designs Page Template', () => {
    let html;

    beforeAll(() => {
        html = loadPageTemplate('designs');
    });

    test('includes unified header placeholder', () => {
        expect(html).toContain('id="unified-header"');
    });

    test('renders button catalog section', () => {
        expect(html).toContain('📋 כל הכפתורים הזמינים במערכת');
        expect(html).toContain('id="buttonSystemTable"');
    });

    test('renders color tokens table', () => {
        expect(html).toContain('id="colorTokensBody"');
        expect(html).toContain('id="colorTokensCount"');
    });

    test('includes button filter input', () => {
        expect(html).toContain('id="buttonFilter"');
        expect(html).toContain('placeholder="🔍 חפש לפי שם');
    });
});

