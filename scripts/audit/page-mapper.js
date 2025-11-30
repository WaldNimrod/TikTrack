/**
 * Page Mapper - Maps all pages in the system
 * ===========================================
 * 
 * Maps pages from:
 * 1. Documentation (PAGES_LIST.md)
 * 2. Page configs (page-initialization-configs.js)
 * 3. HTML files (actual pages)
 * 
 * @version 1.0.0
 * @created January 2025
 */

const fs = require('fs');
const path = require('path');

class PageMapper {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.tradingUiDir = path.join(rootDir, 'trading-ui');
    this.docsDir = path.join(rootDir, 'documentation');
  }

  /**
   * Map all pages
   */
  async map() {
    // 1. Get pages from documentation
    const documentedPages = await this.getDocumentedPages();
    
    // 2. Get pages from configs
    const configPages = await this.getConfigPages();
    
    // 3. Get pages from HTML files
    const htmlPages = await this.getHTMLPages();
    
    // 4. Compare and find discrepancies
    const missingInDocs = htmlPages.filter(p => !documentedPages.includes(p));
    const missingInConfigs = htmlPages.filter(p => !configPages.includes(p));
    const extraInConfigs = configPages.filter(p => !htmlPages.includes(p));
    const duplicates = this.findDuplicates(configPages);
    
    return {
      allPages: [...new Set([...documentedPages, ...configPages, ...htmlPages])],
      documentedPages,
      configPages,
      htmlPages,
      missingInDocs,
      missingInConfigs,
      extraInConfigs,
      duplicates
    };
  }

  /**
   * Get pages from PAGES_LIST.md
   */
  async getDocumentedPages() {
    const pagesListPath = path.join(this.docsDir, 'PAGES_LIST.md');
    if (!fs.existsSync(pagesListPath)) {
      return [];
    }
    
    const content = fs.readFileSync(pagesListPath, 'utf8');
    const pages = new Set();
    
    // Extract page names from markdown tables
    // Pattern: | **page-name.html** | or | page-name.html |
    const pagePattern = /\|\s*\*\*?([a-z0-9_-]+\.html)\*\*?\s*\|/gi;
    let match;
    while ((match = pagePattern.exec(content)) !== null) {
      const pageName = match[1].replace('.html', '');
      pages.add(pageName);
    }
    
    // Also check for pages without .html extension
    const pagePattern2 = /\|\s*\*\*?([a-z0-9_-]+)\*\*?\s*\|/gi;
    while ((match = pagePattern2.exec(content)) !== null) {
      const pageName = match[1];
      // Skip common words
      if (!['עמוד', 'תיאור', 'גישה', 'API', 'Business', 'Logic', 'Service', 'סטטוס'].includes(pageName)) {
        pages.add(pageName);
      }
    }
    
    return Array.from(pages);
  }

  /**
   * Get pages from page-initialization-configs.js
   */
  async getConfigPages() {
    const configsPath = path.join(this.tradingUiDir, 'scripts/page-initialization-configs.js');
    if (!fs.existsSync(configsPath)) {
      return [];
    }
    
    const content = fs.readFileSync(configsPath, 'utf8');
    const pages = new Set();
    
    // Extract page names from config object
    // Pattern: 'page-name': { or "page-name": {
    const pagePattern = /['"]([a-z0-9_-]+(?:\.html)?)['"]\s*:\s*\{/gi;
    let match;
    while ((match = pagePattern.exec(content)) !== null) {
      let pageName = match[1];
      // Remove .html extension if present
      pageName = pageName.replace(/\.html$/, '');
      pages.add(pageName);
    }
    
    return Array.from(pages);
  }

  /**
   * Get pages from HTML files
   */
  async getHTMLPages() {
    const pages = [];
    const htmlFiles = this.getAllHTMLFiles(this.tradingUiDir);
    
    for (const file of htmlFiles) {
      const relativePath = path.relative(this.tradingUiDir, file);
      let pageName = path.basename(file, '.html');
      
      // Skip test files and smart files
      if (pageName.includes('-smart') || pageName.includes('test-') || pageName.includes('smart-')) {
        continue;
      }
      
      // For mockups, keep the full path structure
      if (relativePath.includes('mockups/')) {
        const mockupPath = relativePath.replace('mockups/', '').replace('.html', '');
        pageName = mockupPath.replace(/\//g, '-');
      }
      
      pages.push(pageName);
    }
    
    return pages;
  }

  /**
   * Get all HTML files recursively
   */
  getAllHTMLFiles(dir) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules and backup directories
      if (entry.name === 'node_modules' || entry.name.includes('backup') || entry.name.includes('.backup')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        files.push(...this.getAllHTMLFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Find duplicate page definitions
   */
  findDuplicates(pages) {
    const counts = {};
    const duplicates = [];
    
    pages.forEach(page => {
      counts[page] = (counts[page] || 0) + 1;
    });
    
    Object.entries(counts).forEach(([page, count]) => {
      if (count > 1) {
        duplicates.push({ page, count });
      }
    });
    
    return duplicates;
  }
}

module.exports = PageMapper;

