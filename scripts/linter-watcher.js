#!/usr/bin/env node
/**
 * TikTrack Linter Watcher - Real-time Code Quality Monitor
 * מערכת מוניטור איכות קוד בזמן אמת
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chokidar = require('chokidar');

class LinterWatcher {
  constructor() {
    this.scriptsDir = path.join(__dirname, '..', 'trading-ui', 'scripts');
    this.lastCheck = new Date();
    this.totalIssues = 0;
    this.errors = 0;
    this.warnings = 0;
    this.changedFiles = new Set();
    
    console.log('🏆 TikTrack Linter Watcher Starting...');
    console.log(`📁 Watching: ${this.scriptsDir}`);
    console.log('🔄 Press Ctrl+C to stop\n');
  }

  async start() {
    // Initial check
    await this.runLinterCheck(true);
    
    // Watch for file changes
    const watcher = chokidar.watch(path.join(this.scriptsDir, '*.js'), {
      ignoreInitial: true,
      persistent: true
    });

    watcher.on('change', (filePath) => {
      const fileName = path.basename(filePath);
      this.changedFiles.add(fileName);
      console.log(`🔄 File changed: ${fileName}`);
      
      // Debounced check (wait for multiple changes)
      setTimeout(() => this.runLinterCheck(false), 1000);
    });

    watcher.on('add', (filePath) => {
      const fileName = path.basename(filePath);
      console.log(`➕ New file: ${fileName}`);
      setTimeout(() => this.runLinterCheck(false), 500);
    });

    console.log('👀 Watching for changes...\n');
  }

  async runLinterCheck(isInitial = false) {
    try {
      const startTime = new Date();
      
      if (!isInitial) {
        console.log(`\n⚡ Running linter check... (${startTime.toLocaleTimeString()})`);
      }

      // Run eslint and capture output
      const output = execSync('npm run lint', { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.parseLinterOutput(output);
      this.displayResults(isInitial);
      
    } catch (error) {
      // ESLint returns exit code 1 when there are issues, but that's expected
      if (error.stdout) {
        this.parseLinterOutput(error.stdout);
        this.displayResults(isInitial);
      } else {
        console.log('❌ Error running linter:', error.message);
      }
    }
  }

  parseLinterOutput(output) {
    const lines = output.split('\n');
    
    // Count total problems
    const problemsLine = lines.find(line => 
      line.includes('problems') && (line.includes('error') || line.includes('warning'))
    );
    
    if (problemsLine) {
      // Parse format like "✖ 364 problems (0 errors, 364 warnings)"
      const match = problemsLine.match(/(\d+)\s+problems?\s*\((\d+)\s+errors?,\s*(\d+)\s+warnings?\)/);
      if (match) {
        this.totalIssues = parseInt(match[1]);
        this.errors = parseInt(match[2]);
        this.warnings = parseInt(match[3]);
      }
    }
  }

  displayResults(isInitial) {
    this.lastCheck = new Date();
    
    const timeStr = this.lastCheck.toLocaleTimeString();
    const improvement = ((1636 - this.totalIssues) / 1636 * 100).toFixed(1);
    
    if (isInitial) {
      console.log('📊 Initial Linter Status:');
    } else {
      console.log('📊 Linter Check Results:');
    }
    
    console.log(`   🎯 Total Issues: ${this.totalIssues} (${improvement}% improved from start)`);
    
    if (this.errors === 0) {
      console.log(`   ✅ Errors: ${this.errors} (PERFECT!)`);
    } else {
      console.log(`   🚨 Errors: ${this.errors}`);
    }
    
    console.log(`   ⚠️  Warnings: ${this.warnings}`);
    console.log(`   ⏰ Last Check: ${timeStr}`);
    
    if (this.changedFiles.size > 0) {
      console.log(`   📝 Changed Files: ${Array.from(this.changedFiles).join(', ')}`);
      this.changedFiles.clear();
    }
    
    // Quality status
    if (this.errors === 0 && this.totalIssues < 400) {
      console.log('   🏆 Quality Status: EXCELLENT');
    } else if (this.errors === 0) {
      console.log('   ✅ Quality Status: GOOD');
    } else {
      console.log('   ⚠️  Quality Status: NEEDS ATTENTION');
    }
    
    console.log('   📈 Quick Commands:');
    console.log('     npm run lint:fix     - Auto-fix issues');
    console.log('     npm run quality:report - Generate HTML report');
    console.log('     npm run lint:dashboard - Open dashboard');
    console.log('');
  }

  async generateRealtimeReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      totalIssues: this.totalIssues,
      errors: this.errors,
      warnings: this.warnings,
      improvement: ((1636 - this.totalIssues) / 1636 * 100).toFixed(1),
      qualityStatus: this.errors === 0 ? 'GOOD' : 'NEEDS_ATTENTION'
    };

    // Write JSON report for dashboard
    const reportPath = path.join(__dirname, '..', 'linter-status.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Linter Watcher stopping...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Linter Watcher terminated...');
  process.exit(0);
});

// Start the watcher
const watcher = new LinterWatcher();
watcher.start().catch(console.error);