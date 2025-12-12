const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Updating all pages to use bundles...');

// Get list of HTML files
const htmlDir = path.join(__dirname, 'production/trading-ui');
const htmlFiles = fs.readdirSync(htmlDir)
  .filter(file => file.endsWith('.html'))
  .map(file => path.basename(file, '.html'));

console.log(`📄 Found ${htmlFiles.length} HTML pages to update`);

let updated = 0;
let errors = 0;

htmlFiles.forEach(pageName => {
  try {
    console.log(`  📝 Updating ${pageName}.html...`);
    
    // Run the script generator for this page
    const output = execSync(`node trading-ui/scripts/generate-script-loading-code.js ${pageName}`, {
      encoding: 'utf8',
      cwd: __dirname
    });
    
    // Find the HTML file
    const htmlFile = path.join(htmlDir, `${pageName}.html`);
    
    // Read current content
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Replace script loading section
    const scriptSectionRegex = /<!-- ===== START SCRIPT LOADING ORDER ===== -->[\s\S]*?<!-- ===== END SCRIPT LOADING ORDER ===== -->/;
    
    if (scriptSectionRegex.test(content)) {
      content = content.replace(scriptSectionRegex, output.trim());
      
      // Write back to file
      fs.writeFileSync(htmlFile, content, 'utf8');
      console.log(`    ✅ Updated ${pageName}.html`);
      updated++;
    } else {
      console.log(`    ⚠️  No script section found in ${pageName}.html`);
    }
    
  } catch (error) {
    console.error(`    ❌ Error updating ${pageName}.html:`, error.message);
    errors++;
  }
});

console.log('\n📊 Summary:');
console.log(`  ✅ Updated: ${updated}`);
console.log(`  ❌ Errors: ${errors}`);
console.log(`  📄 Total pages: ${htmlFiles.length}`);

if (errors === 0) {
  console.log('\n🎉 All pages updated successfully!');
} else {
  console.log('\n⚠️  Some pages had errors');
}
