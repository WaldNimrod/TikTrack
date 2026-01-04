const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PAGES_TO_CHECK = [
  '/conditions_modals',
  '/db_display',
  '/system_management'
];

let verificationResults = {
  timestamp: new Date().toISOString().replace(/:/g, '-').split('.')[0],
  pages_checked: [],
  deployment_status: 'unknown',
  issues_found: []
};

async function checkPageSource(pageUrl) {
  console.log(`Checking deployment for: ${pageUrl}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:8080${pageUrl}`, { waitUntil: 'networkidle2' });

    // Get page source
    const source = await page.content();

    // Extract script tags with their src and timestamps
    const scriptMatches = source.match(/<script[^>]*src="([^"]*\.js(?:\?v=[^"]*)?)"[^>]*>/g) || [];

    const scripts = scriptMatches.map(scriptTag => {
      const srcMatch = scriptTag.match(/src="([^"]*\.js(?:\?v=[^"]*)?)"/);
      const src = srcMatch ? srcMatch[1] : null;

      // Check if has timestamp/version parameter
      const hasTimestamp = src && (src.includes('?v=') || src.includes('?t=') || src.includes('?ts='));

      return {
        src: src,
        hasTimestamp: hasTimestamp,
        fullTag: scriptTag
      };
    });

    // Check for common script patterns
    const hasInitSystem = source.includes('init-system-management.js') ||
                         source.includes('init_system_management.js');
    const hasModalManager = source.includes('modal-manager-v2.js');
    const hasPageConfig = source.includes('page-initialization-configs.js');

    const result = {
      page: pageUrl,
      scripts_found: scripts.length,
      scripts_with_timestamps: scripts.filter(s => s.hasTimestamp).length,
      scripts_without_timestamps: scripts.filter(s => !s.hasTimestamp).length,
      has_init_system: hasInitSystem,
      has_modal_manager: hasModalManager,
      has_page_config: hasPageConfig,
      source_length: source.length,
      issues: []
    };

    // Check for issues
    if (result.scripts_without_timestamps > 0) {
      result.issues.push(`${result.scripts_without_timestamps} scripts without timestamps (cache issues)`);
    }

    if (!result.has_init_system) {
      result.issues.push('Missing init-system-management.js script');
    }

    if (!result.has_modal_manager) {
      result.issues.push('Missing modal-manager-v2.js script');
    }

    if (!result.has_page_config) {
      result.issues.push('Missing page-initialization-configs.js script');
    }

    console.log(`  Scripts: ${result.scripts_found} total`);
    console.log(`  With timestamps: ${result.scripts_with_timestamps}`);
    console.log(`  Without timestamps: ${result.scripts_without_timestamps}`);
    console.log(`  Init system: ${result.has_init_system ? 'YES' : 'NO'}`);
    console.log(`  Modal manager: ${result.has_modal_manager ? 'YES' : 'NO'}`);
    console.log(`  Page config: ${result.has_page_config ? 'YES' : 'NO'}`);

    if (result.issues.length > 0) {
      console.log(`  Issues: ${result.issues.join(', ')}`);
    } else {
      console.log(`  Status: ✅ Clean deployment`);
    }

    return result;

  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return {
      page: pageUrl,
      error: error.message,
      scripts_found: 0,
      issues: ['Page load failed']
    };
  } finally {
    await browser.close();
  }
}

async function verifyDeployment() {
  console.log('🔍 Verifying deployment timestamps and script loading...\n');

  for (const pageUrl of PAGES_TO_CHECK) {
    const result = await checkPageSource(pageUrl);
    verificationResults.pages_checked.push(result);

    if (result.issues && result.issues.length > 0) {
      verificationResults.issues_found.push(...result.issues.map(issue => `${pageUrl}: ${issue}`));
    }

    console.log('');
  }

  // Overall assessment
  const totalIssues = verificationResults.issues_found.length;
  const totalPages = verificationResults.pages_checked.length;
  const cleanPages = verificationResults.pages_checked.filter(p => !p.issues || p.issues.length === 0).length;

  verificationResults.deployment_status = totalIssues === 0 ? 'PASS ✅' : 'FAIL ❌';

  console.log('📊 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Pages checked: ${totalPages}`);
  console.log(`Clean pages: ${cleanPages}`);
  console.log(`Issues found: ${totalIssues}`);
  console.log(`Status: ${verificationResults.deployment_status}`);

  if (totalIssues > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    verificationResults.issues_found.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }

  // Save results
  const jsonFile = path.join('documentation/05-REPORTS/artifacts/2026_01_03', `team_d_deployment_verification_${verificationResults.timestamp}.json`);
  const txtFile = path.join('documentation/05-REPORTS/artifacts/2026_01_03', `team_d_deployment_verification_${verificationResults.timestamp}.txt`);

  fs.writeFileSync(jsonFile, JSON.stringify(verificationResults, null, 2));
  fs.writeFileSync(txtFile, generateTextReport(verificationResults));

  console.log('\n💾 Results saved:');
  console.log(`   JSON: ${jsonFile}`);
  console.log(`   TXT: ${txtFile}`);

  return verificationResults;
}

function generateTextReport(data) {
  let report = `================================================================================\n`;
  report += `TEAM D - DEPLOYMENT VERIFICATION REPORT\n`;
  report += `================================================================================\n\n`;

  report += `Timestamp: ${data.timestamp}\n`;
  report += `Status: ${data.deployment_status}\n\n`;

  report += `SUMMARY\n`;
  report += `=======\n`;
  report += `Pages checked: ${data.pages_checked.length}\n`;
  report += `Issues found: ${data.issues_found.length}\n\n`;

  report += `PAGE DETAILS\n`;
  report += `============\n`;

  data.pages_checked.forEach(page => {
    report += `Page: ${page.page}\n`;
    if (page.error) {
      report += `  Error: ${page.error}\n`;
    } else {
      report += `  Scripts: ${page.scripts_found} total\n`;
      report += `  With timestamps: ${page.scripts_with_timestamps}\n`;
      report += `  Without timestamps: ${page.scripts_without_timestamps}\n`;
      report += `  Init system: ${page.has_init_system ? 'YES' : 'NO'}\n`;
      report += `  Modal manager: ${page.has_modal_manager ? 'YES' : 'NO'}\n`;
      report += `  Page config: ${page.has_page_config ? 'YES' : 'NO'}\n`;
    }

    if (page.issues && page.issues.length > 0) {
      report += `  Issues:\n`;
      page.issues.forEach(issue => {
        report += `    - ${issue}\n`;
      });
    } else {
      report += `  Status: ✅ Clean\n`;
    }
    report += '\n';
  });

  if (data.issues_found.length > 0) {
    report += `ALL ISSUES\n`;
    report += `==========\n`;
    data.issues_found.forEach(issue => {
      report += `- ${issue}\n`;
    });
  }

  report += `================================================================================\n`;

  return report;
}

verifyDeployment().then(results => {
  console.log(`\n✅ Verification Complete: ${results.deployment_status}`);
  process.exit(results.deployment_status.includes('PASS') ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification Failed:', error);
  process.exit(1);
});
