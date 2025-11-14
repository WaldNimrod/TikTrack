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

const { loadPageTemplate } = require('../../utils/page-test-utils');

describe('Alerts Page E2E Tests', () => {
    let htmlContent;

    beforeAll(() => {
        htmlContent = loadPageTemplate('alerts');
    });

    test('should load alerts page successfully', () => {
        expect(htmlContent.includes('alerts-page')).toBe(true);
    });

    test('should have alerts table', () => {
        expect(
            htmlContent.includes('alertsTable') ||
            htmlContent.includes('data-table-type="alerts"')
        ).toBe(true);
    });

    test('should have table actions', () => {
        expect(htmlContent.includes("showModalSafe('alertsModal','add')")).toBe(true);
    });

    test('should load required scripts', () => {
        expect(htmlContent.includes('alerts.js')).toBe(true);
    });

    test('should have proper page structure', () => {
        expect(htmlContent.includes('main-content')).toBe(true);
    });

    test('should be responsive', () => {
        expect(htmlContent.includes('meta name="viewport"')).toBe(true);
    });
});
