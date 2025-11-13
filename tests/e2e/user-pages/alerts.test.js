/**
 * Alerts Page E2E Tests - TikTrack
 * =================================
 * 
 * End-to-end tests for the alerts page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

describe('Alerts Page E2E Tests', () => {
    let rawHtml;

    beforeAll(() => {
        const htmlPath = path.join(__dirname, '../../../trading-ui/alerts.html');
        rawHtml = fs.readFileSync(htmlPath, 'utf8');
    });

    test('should load alerts page successfully', () => {
        expect(rawHtml.includes('alerts-page')).toBe(true);
    });

    test('should have alerts table', () => {
        expect(
            rawHtml.includes('alertsTable') ||
            rawHtml.includes('data-table-type="alerts"')
        ).toBe(true);
    });

    test('should have table actions', () => {
        expect(rawHtml.includes("showModalSafe('alertsModal','add')")).toBe(true);
    });

    test('should load required scripts', () => {
        expect(rawHtml.includes('alerts.js')).toBe(true);
    });

    test('should have proper page structure', () => {
        expect(rawHtml.includes('main-content')).toBe(true);
    });

    test('should be responsive', () => {
        expect(rawHtml.includes('meta name="viewport"')).toBe(true);
    });
});
