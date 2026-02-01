/**
 * PHOENIX G-BRIDGE: Local Pre-flight Emulator (v2.0)
 * ------------------------------------------------
 * תפקיד: הרצת ולידציה מתקדמת ויצירת תצוגת סנדבוקס מקומית בקרסור.
 * שימוש: node "HOENIX G-BRIDGE.js" [file_name.html]
 * ------------------------------------------------
 * 
 * בדיקות v2.0:
 * - Physical Property Blocker (RTL Charter)
 * - Z-Index Registry (DNA Variables)
 * - Color Clamp (DNA Variables)
 * - Magic Numbers Detection (DNA Multiples)
 * - CSS Shorthand Enforcement
 * - LEGO System Compliance
 * - ITCSS Hierarchy Validation
 */

const fs = require('fs');
const path = require('path');

// --- DNA Registry (משתנים מאושרים) ---
const APPROVED_COLORS = [
    '#007AFF', '#dc2626', '#34c759', '#ff9500', // Apple Design System
    '#26baac', '#ff9e04', // Phoenix Brand
    '#ffffff', '#f8fafc', '#e5e5e5', '#1d1d1f', '#86868b', // Grays
    '#059669', '#f8fafc', '#26baac', '#dc2626' // Legacy compatibility
];

const APPROVED_Z_INDEX_VARS = [
    '--z-index-base',
    '--z-index-dropdown',
    '--z-index-sticky',
    '--z-index-header',
    '--z-index-modal',
    '--z-index-tooltip',
    '--z-index-notification',
    '--z-index-g-bridge-banner'
];

const DNA_BASE_UNIT = 8; // יחידת DNA בסיסית

// --- 1. Enhanced Audit Rules (v2.0) ---
function runAudit(content, fileName) {
    const issues = [];
    
    // --- 1.1 Physical Property Blocker ---
    const physicalProperties = [
        /\bmargin-left\s*:/gi,
        /\bmargin-right\s*:/gi,
        /\bpadding-left\s*:/gi,
        /\bpadding-right\s*:/gi,
        /\bleft\s*:\s*[^i]/gi, // לא כולל "inset"
        /\bright\s*:\s*[^i]/gi, // לא כולל "inset"
        /\bfloat\s*:\s*left/gi,
        /\bfloat\s*:\s*right/gi,
        /\btext-align\s*:\s*left/gi,
        /\btext-align\s*:\s*right/gi
    ];
    
    physicalProperties.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
            const propNames = ['margin-left', 'margin-right', 'padding-left', 'padding-right', 
                              'left:', 'right:', 'float: left', 'float: right', 
                              'text-align: left', 'text-align: right'];
            matches.forEach(() => {
                issues.push(`RTL: Physical property [${propNames[index]}] found. Use logical properties instead.`);
            });
        }
    });
    
    // --- 1.2 Z-Index Registry Check ---
    const zIndexPattern = /\bz-index\s*:\s*(\d+)/gi;
    const zIndexMatches = content.match(zIndexPattern);
    if (zIndexMatches) {
        zIndexMatches.forEach(match => {
            const zValue = match.match(/\d+/)[0];
            // בדיקה אם זה לא דרך משתנה
            if (!content.includes(`z-index: var(--z-index`)) {
                // בדיקה אם זה לא חלק מהגדרת משתנה
                const beforeMatch = content.substring(Math.max(0, content.indexOf(match) - 50), content.indexOf(match));
                if (!beforeMatch.includes('--z-index')) {
                    issues.push(`Z-INDEX: Direct z-index value [${zValue}] found. Use CSS variable (--z-index-*) instead.`);
                }
            }
        });
    }
    
    // בדיקה נוספת - z-index ישיר ללא var()
    const directZIndex = /\bz-index\s*:\s*(?!var\(--z-index)\d+/gi;
    if (directZIndex.test(content)) {
        const matches = content.match(directZIndex);
        matches.forEach(match => {
            if (!match.includes('var(--z-index')) {
                issues.push(`Z-INDEX: Direct z-index found. Use CSS variable (--z-index-*) instead.`);
            }
        });
    }
    
    // --- 1.3 Color Clamp ---
    // בדיקת צבעים ישירים (hex, rgb, rgba) - מתעלם מ-:root ו-G-BRIDGE-EXEMPT
    const lines = content.split('\n');
    lines.forEach((line, lineIndex) => {
        // בדיקת hex colors
        const hexPattern = /#[0-9A-Fa-f]{3,6}/gi;
        const hexMatches = line.match(hexPattern);
        if (hexMatches) {
            hexMatches.forEach(match => {
                const color = match.toLowerCase();
                // בדיקה אם זה ב-:root block
                let isInRootBlock = false;
                for (let i = lineIndex; i >= 0; i--) {
                    if (lines[i].includes(':root')) {
                        isInRootBlock = true;
                        break;
                    }
                    if (lines[i].includes('}') && !lines[i].includes(':root')) {
                        break;
                    }
                }
                
                const hasExempt = line.includes('G-BRIDGE-EXEMPT');
                const isInVar = line.includes('var(--');
                const isApproved = APPROVED_COLORS.includes(color);
                const isVarDefinition = line.includes('--') && line.includes(':');
                
                if (!isInRootBlock && !hasExempt && !isInVar && !isApproved && !isVarDefinition) {
                    issues.push(`DNA: Hardcoded Hex color [${match}] found. Use CSS variable instead.`);
                }
            });
        }
        
        // בדיקת rgb/rgba colors
        const rgbPattern = /\b(rgb|rgba)\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+/gi;
        const rgbMatches = line.match(rgbPattern);
        if (rgbMatches) {
            rgbMatches.forEach(match => {
                // בדיקה אם זה ב-:root block
                let isInRootBlock = false;
                for (let i = lineIndex; i >= 0; i--) {
                    if (lines[i].includes(':root')) {
                        isInRootBlock = true;
                        break;
                    }
                    if (lines[i].includes('}') && !lines[i].includes(':root')) {
                        break;
                    }
                }
                
                const hasExempt = line.includes('G-BRIDGE-EXEMPT');
                const isInVar = line.includes('var(--');
                const isVarDefinition = line.includes('--') && line.includes(':');
                
                if (!isInRootBlock && !hasExempt && !isInVar && !isVarDefinition) {
                    issues.push(`DNA: Hardcoded RGB color [${match}] found. Use CSS variable instead.`);
                }
            });
        }
    });
    
    // --- 1.4 Magic Numbers Detection ---
    // בדיקת מספרים שרירותיים ב-margin/padding (לא כפולות של 8)
    const spacingPattern = /\b(margin|padding)(?:-block|-inline)?\s*:\s*(\d+)px/gi;
    const spacingMatches = content.match(spacingPattern);
    if (spacingMatches) {
        spacingMatches.forEach(match => {
            const pxValue = parseInt(match.match(/(\d+)px/)[1]);
            if (pxValue % DNA_BASE_UNIT !== 0 && pxValue !== 0) {
                issues.push(`MAINTENANCE: Magic number [${pxValue}px] found. Use DNA multiple of ${DNA_BASE_UNIT}px or CSS variable.`);
            }
        });
    }
    
    // --- 1.5 CSS Shorthand Enforcement (Warning only) ---
    // בדיקה של longhand במקום shorthand (התראה בלבד)
    const longhandPatterns = [
        /\bmargin-top\s*:.*\bmargin-right\s*:.*\bmargin-bottom\s*:.*\bmargin-left\s*:/s,
        /\bpadding-top\s*:.*\bpadding-right\s*:.*\bpadding-bottom\s*:.*\bpadding-left\s*:/s
    ];
    
    longhandPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
            const types = ['margin', 'padding'];
            issues.push(`MAINTENANCE: Longhand ${types[index]} found. Consider using shorthand (margin-block/inline).`);
        }
    });
    
    // --- 1.6 LEGO System Compliance ---
    if (content.includes('class="section"') || content.includes('class="card"')) {
        issues.push("LEGO: Use <tt-section> instead of div with class 'section' or 'card'.");
    }
    
    // --- 1.7 ITCSS Hierarchy Validation ---
    // בדיקה שקבצי CSS נטענים בסדר הנכון (בקובץ HTML)
    // הערה: עמודי Auth (LOGIN, REGISTER, RESET_PWD) לא טוענים phoenix-header.css - זה תקין
    if (fileName.endsWith('.html')) {
        const isAuthPage = fileName.toLowerCase().includes('login') || 
                           fileName.toLowerCase().includes('register') || 
                           fileName.toLowerCase().includes('reset');
        
        const picoIndex = content.indexOf('pico.min.css');
        const baseIndex = content.indexOf('phoenix-base.css');
        const componentsIndex = content.indexOf('phoenix-components.css');
        const headerIndex = content.indexOf('phoenix-header.css');
        
        if (picoIndex !== -1 && baseIndex !== -1) {
            if (baseIndex < picoIndex) {
                issues.push("ITCSS: phoenix-base.css must be loaded AFTER pico.min.css.");
            }
        }
        
        if (baseIndex !== -1 && componentsIndex !== -1) {
            if (componentsIndex < baseIndex) {
                issues.push("ITCSS: phoenix-components.css must be loaded AFTER phoenix-base.css.");
            }
        }
        
        // בדיקת header רק אם זה לא עמוד Auth
        if (!isAuthPage && componentsIndex !== -1 && headerIndex !== -1) {
            if (headerIndex < componentsIndex) {
                issues.push("ITCSS: phoenix-header.css must be loaded AFTER phoenix-components.css.");
            }
        }
    }
    
    // --- 1.8 Structure Validation ---
    if (fileName.toLowerCase().includes("index.html") && !content.includes('unified-header')) {
        issues.push("STRUCTURE: Missing Unified Header (120px).");
    }
    
    return { passed: issues.length === 0, issues };
}

// --- 2. Shell Injection (זהה לחלוטין ל-GAS 30_UI) ---
function wrapInShell(content, fileName, audit) {
    const bannerColor = audit.passed ? "#059669" : "#dc2626";
    const status = audit.passed ? "APPROVED" : "REJECTED";
    const timestamp = new Date().toLocaleTimeString('he-IL');
    const issueCount = audit.issues.length;

    return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
<script src="https://unpkg.com/lucide@latest"></script>
<style>
    body { margin:0; padding-top:45px; font-family:sans-serif; background:#f8fafc; }
    .g-bridge-banner { position:fixed; top:0; inset-inline-start:0; inset-inline-end:0; background:${bannerColor}; color:white; padding:8px; font-size:10px; font-weight:900; z-index:10002; text-align:center; }
</style></head><body>
<div class="g-bridge-banner">🛡️ LOCAL G-BRIDGE v2.0 [${timestamp}] | ${status} | ${audit.passed ? 'FIDELITY READY' : `${issueCount} issue(s) found`}</div>
<main id="phoenix-root">${content}</main>
<script>window.onload=()=>{ if(window.lucide) lucide.createIcons(); };</script></body></html>`;
}

// --- 3. Execution Logic ---
const targetFile = process.argv[2];
if (!targetFile) {
    console.error("❌ Usage: node \"HOENIX G-BRIDGE.js\" [file_name.html]");
    console.error("   Example: node \"HOENIX G-BRIDGE.js\" D15_LOGIN.html");
    process.exit(1);
}

try {
    const rawContent = fs.readFileSync(targetFile, 'utf8');
    const audit = runAudit(rawContent, targetFile);
    const previewContent = wrapInShell(rawContent, targetFile, audit);
    
    const previewFileName = `_PREVIEW_${targetFile}`;
    fs.writeFileSync(previewFileName, previewContent);
    
    console.log(`\n=========================================`);
    console.log(`🛡️ G-BRIDGE v2.0 LOCAL AUDIT: ${targetFile}`);
    console.log(`Status: ${audit.passed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`Issues Found: ${audit.issues.length}`);
    console.log(`-----------------------------------------`);
    if (!audit.passed) {
        console.log(`\n❌ Issues:`);
        audit.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
    } else {
        console.log(`✅ All checks passed!`);
    }
    console.log(`-----------------------------------------`);
    console.log(`👉 Open '${previewFileName}' to see the Sandbox view.`);
    console.log(`=========================================\n`);
} catch (err) {
    console.error(`❌ Error reading file: ${err.message}`);
    process.exit(1);
}
