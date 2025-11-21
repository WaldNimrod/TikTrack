#!/usr/bin/env node
/**
 * Manual Update Guide Generator
 * Generates detailed manual update guides for each page
 * 
 * Usage:
 *   node scripts/generate-manual-update-guide.js [--scan-file SCAN_FILE.json] [--page PAGE_NAME]
 * 
 * Example:
 *   node scripts/generate-manual-update-guide.js --scan-file reports/button-tooltips-scan/scan-123.json --page trades
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'button-tooltips-scan');

// Parse command line arguments
const args = process.argv.slice(2);
const scanFile = args.includes('--scan-file') ? args[args.indexOf('--scan-file') + 1] : null;
const pageFilter = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;

/**
 * Find latest scan file if not provided
 */
function findLatestScanFile() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    return null;
  }
  
  const files = fs.readdirSync(OUTPUT_DIR);
  const scanFiles = files.filter(f => f.startsWith('button-tooltips-scan-') && f.endsWith('.json'));
  
  if (scanFiles.length === 0) return null;
  return path.join(OUTPUT_DIR, scanFiles.sort().reverse()[0]);
}

/**
 * Generate manual update guide for a single page
 */
function generateManualUpdateGuide(pageData) {
  const pageName = pageData.page;
  
  let guide = `# מדריך עדכון ידני - ${pageName}.html\n\n`;
  guide += `**תאריך יצירה:** ${new Date().toLocaleString('he-IL')}\n\n`;
  
  guide += `## הוראות כלליות\n\n`;
  guide += `1. **גיבוי:** לפני כל עדכון, צור גיבוי של הקובץ\n`;
  guide += `2. **עריכה:** פתח את הקובץ \`${pageData.file}\` בעורך טקסט\n`;
  guide += `3. **מיקום:** השתמש במספר השורה כדי למצוא את הכפתור המדויק\n`;
  guide += `4. **בדיקה:** לאחר כל עדכון, בדוק בדפדפן שהטולטיפ מוצג נכון\n`;
  guide += `\n`;
  
  // Static buttons
  const staticButtonsNeedingFix = pageData.buttons.filter(b => 
    (b.needsTooltip || b.needsId) && !b.inModal
  );
  
  if (staticButtonsNeedingFix.length > 0) {
    guide += `## כפתורים סטטיים - עדכון ידני\n\n`;
    guide += `### שלב 1: מצא את הכפתור\n\n`;
    guide += `עבור לכל כפתור ברשימה למטה ומצא אותו בקובץ לפי מספר השורה.\n\n`;
    
    staticButtonsNeedingFix.forEach((button, index) => {
      guide += `### כפתור #${index + 1}\n\n`;
      guide += `**מיקום:** שורה ${button.line}\n\n`;
      guide += `**קוד נוכחי (משוער):**\n`;
      guide += `\`\`\`html\n`;
      guide += `${button.html || 'לא זמין'}\n`;
      guide += `\`\`\`\n\n`;
      
      guide += `**קוד מעודכן:**\n`;
      guide += `\`\`\`html\n`;
      
      // Build updated HTML
      let updatedHTML = button.html || '';
      if (button.needsId && button.recommendedId) {
        if (!updatedHTML.includes('data-id=')) {
          // Find where to insert data-id (after data-button-type)
          if (updatedHTML.includes('data-button-type')) {
            updatedHTML = updatedHTML.replace(
              /(data-button-type="[^"]*")/,
              `$1 data-id="${button.recommendedId}"`
            );
          } else {
            updatedHTML = updatedHTML.replace(/<button/, `<button data-id="${button.recommendedId}"`);
          }
        }
      }
      
      if (button.needsTooltip && button.recommendedTooltip) {
        if (!updatedHTML.includes('data-tooltip=')) {
          // Find where to insert data-tooltip
          if (updatedHTML.includes('data-id=')) {
            updatedHTML = updatedHTML.replace(
              /(data-id="[^"]*")/,
              `$1 data-tooltip="${button.recommendedTooltip}" data-tooltip-placement="top" data-tooltip-trigger="hover"`
            );
          } else if (updatedHTML.includes('data-button-type')) {
            updatedHTML = updatedHTML.replace(
              /(data-button-type="[^"]*")/,
              `$1 data-tooltip="${button.recommendedTooltip}" data-tooltip-placement="top" data-tooltip-trigger="hover"`
            );
          } else {
            updatedHTML = updatedHTML.replace(/<button/, `<button data-tooltip="${button.recommendedTooltip}" data-tooltip-placement="top" data-tooltip-trigger="hover"`);
          }
        }
      }
      
      guide += `${updatedHTML}\n`;
      guide += `\`\`\`\n\n`;
      
      guide += `**שינויים נדרשים:**\n`;
      if (button.needsId) {
        guide += `- הוסף: \`data-id="${button.recommendedId || 'unique-id'}"\`\n`;
      }
      if (button.needsTooltip) {
        guide += `- הוסף: \`data-tooltip="${button.recommendedTooltip || 'טולטיפ מתאים'}"\`\n`;
        guide += `- הוסף: \`data-tooltip-placement="top"\`\n`;
        guide += `- הוסף: \`data-tooltip-trigger="hover"\`\n`;
      }
      guide += `\n`;
      
      guide += `---\n\n`;
    });
  }
  
  // Modal buttons
  if (pageData.modals && pageData.modals.length > 0) {
    guide += `## כפתורים במודולים - עדכון ידני\n\n`;
    guide += `### הוראות כלליות למודולים\n\n`;
    guide += `כפתורים במודולים נמצאים בתוך אלמנטים עם class \`modal\`.\n`;
    guide += `מצא את המודול לפי ID שלו ואז את הכפתור לפי מספר השורה.\n\n`;
    
    pageData.modals.forEach((modal, modalIndex) => {
      const modalButtonsNeedingFix = modal.buttons.filter(b => b.needsTooltip || b.needsId);
      
      if (modalButtonsNeedingFix.length > 0) {
        guide += `### מודול ${modalIndex + 1}: ${modal.id || 'ללא ID'}\n\n`;
        guide += `**מיקום המודול:** חפש \`id="${modal.id || 'modal'}"\` או \`class="modal"\`\n\n`;
        
        modalButtonsNeedingFix.forEach((button, btnIndex) => {
          guide += `#### כפתור #${btnIndex + 1} - ${button.type}\n\n`;
          guide += `**מיקום:** שורה ${button.line}, מיקום במודול: ${button.location || 'unknown'}\n\n`;
          guide += `**קוד נוכחי (משוער):**\n`;
          guide += `\`\`\`html\n`;
          guide += `${button.html || 'לא זמין'}\n`;
          guide += `\`\`\`\n\n`;
          
          guide += `**שינויים נדרשים:**\n`;
          if (button.needsId) {
            guide += `- הוסף: \`data-id="..."\` (הגדר ID ייחודי)\n`;
          }
          if (button.needsTooltip) {
            guide += `- הוסף: \`data-tooltip="..."\` (הגדר טולטיפ מתאים)\n`;
            guide += `- הוסף: \`data-tooltip-placement="top"\`\n`;
            guide += `- הוסף: \`data-tooltip-trigger="hover"\`\n`;
          }
          guide += `\n`;
        });
        
        guide += `---\n\n`;
      }
    });
  }
  
  // Checklist
  guide += `## Checklist - רשימת בדיקה\n\n`;
  guide += `לאחר ביצוע כל העדכונים, סמן את הפריטים הבאים:\n\n`;
  
  if (staticButtonsNeedingFix.length > 0) {
    guide += `### כפתורים סטטיים\n\n`;
    staticButtonsNeedingFix.forEach((button, index) => {
      guide += `- [ ] כפתור #${index + 1} (שורה ${button.line}) - ${button.needsTooltip ? 'טולטיפ' : ''} ${button.needsId ? 'ID' : ''}\n`;
    });
    guide += `\n`;
  }
  
  if (pageData.modals && pageData.modals.length > 0) {
    const modalButtonsNeedingFix = pageData.modals.reduce((all, m) => 
      all.concat(m.buttons.filter(b => b.needsTooltip || b.needsId)), []);
    
    if (modalButtonsNeedingFix.length > 0) {
      guide += `### כפתורים במודולים\n\n`;
      modalButtonsNeedingFix.forEach((button, index) => {
        guide += `- [ ] כפתור במודול (שורה ${button.line}) - ${button.needsTooltip ? 'טולטיפ' : ''} ${button.needsId ? 'ID' : ''}\n`;
      });
      guide += `\n`;
    }
  }
  
  guide += `### בדיקה סופית\n\n`;
  guide += `- [ ] כל הכפתורים עודכנו\n`;
  guide += `- [ ] בדיקה ידנית בדפדפן - כל הטולטיפים מוצגים נכון\n`;
  guide += `- [ ] אין שגיאות בקונסולה\n`;
  guide += `- [ ] הרצת \`node scripts/verify-tooltips-completeness.js --page ${pageName}\` - כל הבדיקות עברו\n`;
  guide += `\n`;
  
  // Tips
  guide += `## טיפים\n\n`;
  guide += `1. **ID ייחודיים:** ודא שכל \`data-id\` הוא ייחודי בעמוד\n`;
  guide += `2. **טולטיפים ברורים:** השתמש בטולטיפים שמסבירים בבירור מה הכפתור עושה\n`;
  guide += `3. **עקביות:** השתמש באותם טולטיפים לכפתורים דומים\n`;
  guide += `4. **בדיקה:** תמיד בדוק בדפדפן לאחר עדכון\n`;
  guide += `\n`;
  
  return guide;
}

/**
 * Main function
 */
function generateManualUpdateGuides() {
  // Find scan file if not provided
  let scanData = null;
  
  if (scanFile && fs.existsSync(scanFile)) {
    scanData = JSON.parse(fs.readFileSync(scanFile, 'utf-8'));
  } else {
    const latest = findLatestScanFile();
    if (latest) {
      console.log(`📂 Using latest scan file: ${latest}`);
      scanData = JSON.parse(fs.readFileSync(latest, 'utf-8'));
    } else {
      console.error('❌ No scan file found. Run scan-button-tooltips.js first.');
      process.exit(1);
    }
  }
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Filter pages if specified
  const pagesToProcess = pageFilter
    ? scanData.pages.filter(p => p.page === pageFilter)
    : scanData.pages;
  
  console.log(`📋 Generating manual update guides for ${pagesToProcess.length} pages...\n`);
  
  pagesToProcess.forEach(pageData => {
    const guide = generateManualUpdateGuide(pageData);
    const outputPath = path.join(OUTPUT_DIR, `manual-update-guide-${pageData.page}.md`);
    fs.writeFileSync(outputPath, guide, 'utf-8');
    console.log(`✅ Generated: manual-update-guide-${pageData.page}.md`);
  });
  
  console.log(`\n💾 Manual update guides saved to: ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  generateManualUpdateGuides();
}

module.exports = { generateManualUpdateGuides, generateManualUpdateGuide };

