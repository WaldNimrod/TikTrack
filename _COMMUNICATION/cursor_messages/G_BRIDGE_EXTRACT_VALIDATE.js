/**
 * G-BRIDGE Content Extractor & Validator
 * ------------------------------------------------
 * תפקיד: חילוץ תוכן מקורי מקבצים עטופים ואימות
 * שימוש: node G_BRIDGE_EXTRACT_VALIDATE.js [file_name.html]
 * ------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// Import G-Bridge audit function (same logic)
function runAudit(content, fileName) {
    const issues = [];
    const physicals = ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'left:', 'right:'];
    
    physicals.forEach(p => {
        if (content.includes(p)) issues.push(`RTL: Physical property [${p}] found.`);
    });

    if (content.includes('class="section"') || content.includes('class="card"')) {
        issues.push("LEGO: Use <tt-section> instead of div.");
    }

    const hexPattern = /(?!#26baac|#dc2626|#f8fafc|#phoenix-root|#unified-header)#[0-9A-Fa-f]{3,6}/gi;
    if (hexPattern.test(content) && !content.includes('var(--')) {
        issues.push("DNA: Hardcoded Hex colors found.");
    }

    if (fileName.toLowerCase().includes("index.html") && !content.includes('unified-header')) {
        issues.push("STRUCTURE: Missing Unified Header (158px).");
    }

    return { passed: issues.length === 0, issues };
}

// Extract original content from wrapped file
function extractOriginalContent(content) {
    // Look for content within <main id="phoenix-root">
    const mainStart = content.indexOf('<main id="phoenix-root">');
    const mainEnd = content.indexOf('</main>', mainStart);
    
    if (mainStart === -1 || mainEnd === -1) {
        // File not wrapped, return as-is
        return content;
    }
    
    // Extract content between <main> tags
    const extracted = content.substring(mainStart + '<main id="phoenix-root">'.length, mainEnd).trim();
    
    // Remove any nested wrapper if exists
    if (extracted.includes('<!DOCTYPE html>')) {
        return extracted;
    }
    
    return extracted;
}

// Main execution
const targetFile = process.argv[2];
if (!targetFile) {
    console.error("❌ Usage: node G_BRIDGE_EXTRACT_VALIDATE.js [file_name.html]");
    process.exit(1);
}

try {
    const rawContent = fs.readFileSync(targetFile, 'utf8');
    
    // Extract original content
    const originalContent = extractOriginalContent(rawContent);
    
    // Run audit on original content only
    const audit = runAudit(originalContent, targetFile);
    
    console.log(`\n=========================================`);
    console.log(`🛡️ G-BRIDGE VALIDATION (Extracted Content): ${targetFile}`);
    console.log(`Status: ${audit.passed ? "✅ PASSED" : "❌ FAILED"}`);
    
    if (!audit.passed) {
        audit.issues.forEach(i => console.log(`   - ${i}`));
    } else {
        console.log(`   ✅ RTL Charter: Compliant`);
        console.log(`   ✅ LEGO System: Compliant`);
        console.log(`   ✅ DNA Variables: Compliant`);
        console.log(`   ✅ Structural Integrity: Compliant`);
    }
    
    console.log(`-----------------------------------------`);
    console.log(`📄 Original content extracted and validated`);
    console.log(`=========================================\n`);
    
    // Save extracted content for review
    const extractedFileName = `_EXTRACTED_${targetFile}`;
    fs.writeFileSync(extractedFileName, originalContent);
    console.log(`💾 Extracted content saved to: ${extractedFileName}\n`);
    
} catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
}
