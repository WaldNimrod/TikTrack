/**
 * PHOENIX G-BRIDGE: Local Pre-flight Emulator (v1.0)
 * ------------------------------------------------
 * תפקיד: הרצת ולידציה ויצירת תצוגת סנדבוקס מקומית בקרסור.
 * שימוש: node local_gbridge_emulator.js [file_name.html]
 * ------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// --- 1. Audit Rules (זהה לחלוטין ל-GAS 20_Audit) ---
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

// --- 2. Shell Injection (זהה לחלוטין ל-GAS 30_UI) ---
function wrapInShell(content, fileName, audit) {
    const bannerColor = audit.passed ? "#059669" : "#dc2626";
    const status = audit.passed ? "APPROVED" : "REJECTED";
    const timestamp = new Date().toLocaleTimeString('he-IL');

    return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
<script src="https://unpkg.com/lucide@latest"></script>
<style>
    body { margin:0; padding-top:45px; font-family:sans-serif; background:#f8fafc; }
    .g-bridge-banner { position:fixed; top:0; left:0; right:0; background:${bannerColor}; color:white; padding:8px; font-size:10px; font-weight:900; z-index:10002; text-align:center; }
</style></head><body>
<div class="g-bridge-banner">🛡️ LOCAL G-BRIDGE [${timestamp}] | ${status} | ${audit.passed ? 'FIDELITY READY' : audit.issues[0]}</div>
<main id="phoenix-root">${content}</main>
<script>window.onload=()=>{ if(window.lucide) lucide.createIcons(); };</script></body></html>`;
}

// --- 3. Execution Logic ---
const targetFile = process.argv[2];
if (!targetFile) {
    console.error("❌ Usage: node local_gbridge_emulator.js [file_name.html]");
    process.exit(1);
}

try {
    const rawContent = fs.readFileSync(targetFile, 'utf8');
    const audit = runAudit(rawContent, targetFile);
    const previewContent = wrapInShell(rawContent, targetFile, audit);
    
    const previewFileName = `_PREVIEW_${targetFile}`;
    fs.writeFileSync(previewFileName, previewContent);
    
    console.log(`\n=========================================`);
    console.log(`🛡️ G-BRIDGE LOCAL AUDIT: ${targetFile}`);
    console.log(`Status: ${audit.passed ? "✅ PASSED" : "❌ FAILED"}`);
    if (!audit.passed) audit.issues.forEach(i => console.log(`   - ${i}`));
    console.log(`-----------------------------------------`);
    console.log(`👉 Open '${previewFileName}' to see the Sandbox view.`);
    console.log(`=========================================\n`);
} catch (err) {
    console.error(`❌ Error reading file: ${err.message}`);
}