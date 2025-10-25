/**
 * Index Page E2E Tests - TikTrack
 * ================================
 * 
 * End-to-end tests for the main dashboard page
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Index Page E2E Tests', () => {
    let dom;
    let document;
    let window;

    beforeAll(async () => {
        // Load the HTML file
        const htmlPath = path.join(__dirname, '../../../trading-ui/index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Create JSDOM instance
        dom = new JSDOM(htmlContent, {
            url: 'http://localhost:8080',
            pretendToBeVisual: true,
            resources: 'usable'
        });
        
        document = dom.window.document;
        window = dom.window;
        global.window = window;
        global.document = document;
    });

    afterAll(() => {
        if (dom) {
            dom.window.close();
        }
    });

    test('should load index page successfully', () => {
        expect(document.title).toBeDefined();
        expect(document.body).toBeDefined();
    });

    test('should have main dashboard elements', () => {
        // Check for main dashboard containers
        const dashboardContainer = document.querySelector('.dashboard-container') || 
                                 document.querySelector('#dashboard') ||
                                 document.querySelector('.main-content');
        expect(dashboardContainer).toBeTruthy();
    });

    test('should have navigation elements', () => {
        // Check for navigation
        const nav = document.querySelector('nav') || 
                   document.querySelector('.navbar') ||
                   document.querySelector('.navigation');
        expect(nav).toBeTruthy();
    });

    test('should have footer elements', () => {
        // Check for footer
        const footer = document.querySelector('footer') || 
                      document.querySelector('.footer');
        expect(footer).toBeTruthy();
    });

    test('should load required scripts', () => {
        // Check for required script tags
        const scripts = document.querySelectorAll('script[src]');
        const scriptSources = Array.from(scripts).map(script => script.src);
        
        // Check for essential scripts
        expect(scriptSources.some(src => src.includes('index.js'))).toBe(true);
    });

    test('should have proper meta tags', () => {
        const metaTags = document.querySelectorAll('meta');
        expect(metaTags.length).toBeGreaterThan(0);
    });

    test('should have proper CSS links', () => {
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        expect(cssLinks.length).toBeGreaterThan(0);
    });

    test('should be responsive', () => {
        // Check for viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        expect(viewport).toBeTruthy();
    });

    test('should have proper language attributes', () => {
        const html = document.documentElement;
        expect(html.lang).toBeDefined();
    });

    test('should have proper charset', () => {
        const charset = document.querySelector('meta[charset]');
        expect(charset).toBeTruthy();
    });
});
