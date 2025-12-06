#!/usr/bin/env node
/**
 * Update All Pages with Async/Defer
 * Updates all HTML pages to use async/defer based on package loading strategy
 */

const fs = require('fs');
const path = require('path');
const { generateScriptLoadingCode } = require('../trading-ui/scripts/generate-script-loading-code');

// Get all pages from page-initialization-configs.js
const configsPath = path.join(__dirname, '..', 'trading-ui', 'scripts', 'page-initialization-configs.js');
let PAGE_CONFIGS = {};

try {
  const configsContent = fs.readFileSync(configsPath, 'utf8');
  const vm = require('vm');
  const context = { window: {}, PAGE_CONFIGS: {}, module: {}, exports: {}, require: require, __dirname, __filename: configsPath };
  vm.createContext(context);
  vm.runInContext(configsContent, context);
  if (context.PAGE_CONFIGS && Object.keys(context.PAGE_CONFIGS).length > 0) {
    PAGE_CONFIGS = context.PAGE_CONFIGS;
  } else if (context.window && context.window.PAGE_CONFIGS) {
    PAGE_CONFIGS = context.window.PAGE_CONFIGS;
  }
} catch (e) {
  console.error('❌ Could not load page configs:', e.message);
  process.exit(1);
}

// Find all HTML files
function findHTMLFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'backup') {
      files.push(...findHTMLFiles(fullPath));
    } else if (stat.isFile() && item.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Update a single HTML file
function updateHTMLFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract page name from file path
    const fileName = path.basename(filePath, '.html');
    
    // Try to find page config - check exact match first
    let pageConfig = PAGE_CONFIGS[fileName];
    
    if (!pageConfig) {
      // Try with different variations
      const variations = [
        fileName.replace(/-/g, '_'),  // ai-analysis -> ai_analysis
        fileName.replace(/_/g, '-'),  // ai_analysis -> ai-analysis
        fileName.replace(/-/g, ''),   // ai-analysis -> aianalysis
        fileName.replace(/_/g, '')    // ai_analysis -> aianalysis
      ];
      
      for (const variation of variations) {
        if (PAGE_CONFIGS[variation]) {
          pageConfig = PAGE_CONFIGS[variation];
          break;
        }
      }
    }
    
    if (!pageConfig) {
      console.log(`⚠️  No config found for: ${fileName} (${filePath})`);
      return { updated: false, reason: 'no_config' };
    }
    
    // Find the script loading section
    const startMarker = '<!-- ===== START SCRIPT LOADING ORDER ===== -->';
    const endMarker = '<!-- ===== FINAL SUMMARY ===== -->';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.log(`⚠️  Script loading section not found in: ${fileName}`);
      return { updated: false, reason: 'no_section' };
    }
    
    // Generate new script loading code - use the key we found in PAGE_CONFIGS
    const pageKey = Object.keys(PAGE_CONFIGS).find(key => PAGE_CONFIGS[key] === pageConfig);
    const newScriptCode = generateScriptLoadingCode(pageKey || fileName);
    
    if (!newScriptCode) {
      console.log(`⚠️  Could not generate script code for: ${fileName}`);
      return { updated: false, reason: 'generation_failed' };
    }
    
    // Replace the section
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    const finalSummaryIndex = after.indexOf('<!-- 🔧 For maintenance: Use generate-script-loading-code.js -->');
    const finalAfter = after.substring(finalSummaryIndex + after.substring(finalSummaryIndex).indexOf('\n') + 1);
    
    const newContent = before + newScriptCode + finalAfter;
    
    // Write updated file
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return { updated: true, pageName: fileName };
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return { updated: false, reason: 'error', error: error.message };
  }
}

// Main function
function main() {
  console.log('='.repeat(80));
  console.log('🔄 עדכון כל העמודים עם async/defer');
  console.log('='.repeat(80));
  console.log();
  
  const tradingUIDir = path.join(__dirname, '..', 'trading-ui');
  const htmlFiles = findHTMLFiles(tradingUIDir);
  
  console.log(`📁 נמצאו ${htmlFiles.length} קבצי HTML`);
  console.log();
  
  const results = {
    updated: [],
    skipped: [],
    errors: []
  };
  
  // Update files
  for (const filePath of htmlFiles) {
    const fileName = path.basename(filePath);
    console.log(`🔄 מעדכן: ${fileName}...`);
    
    const result = updateHTMLFile(filePath);
    
    if (result.updated) {
      results.updated.push(fileName);
      console.log(`  ✅ עודכן בהצלחה`);
    } else {
      results.skipped.push({ file: fileName, reason: result.reason });
      console.log(`  ⚠️  דולג: ${result.reason}`);
    }
    console.log();
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('📊 סיכום');
  console.log('='.repeat(80));
  console.log(`✅ עודכנו: ${results.updated.length} עמודים`);
  console.log(`⚠️  דולגו: ${results.skipped.length} עמודים`);
  console.log(`❌ שגיאות: ${results.errors.length} עמודים`);
  console.log();
  
  if (results.skipped.length > 0) {
    console.log('עמודים שדולגו:');
    results.skipped.forEach(item => {
      console.log(`  - ${item.file}: ${item.reason}`);
    });
    console.log();
  }
  
  console.log('='.repeat(80));
  console.log('✅ עדכון הושלם');
  console.log('='.repeat(80));
}

if (require.main === module) {
  main();
}

module.exports = { updateHTMLFile, findHTMLFiles };

