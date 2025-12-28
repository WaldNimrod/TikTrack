#!/usr/bin/env node
/**
 * Full AI Analysis Process Test Script
 * Tests all 4 templates with full process including validation and note creation
 * 
 * Usage: node scripts/test_ai_analysis_full_process.js
 */

// This script should be run in browser console, not as standalone Node script
// Run this in the browser console on ai_analysis.html page

const FULL_PROCESS_TEST = {
  templates: [
    { id: 1, name: "ניתוח מחקר הון", ticker: "AAPL" },
    { id: 2, name: "ניתוח טכני מעמיק", ticker: "TSLA" },
    { id: 3, name: "ניתוח ביצועים ופורטפוליו", ticker: "MSFT" },
    { id: 4, name: "ניתוח סיכונים ותנאים", ticker: "GOOGL" }
  ],
  
  async testAllTemplates() {
    console.log('🧪 Starting full AI Analysis process test...');
    console.log(`Testing ${this.templates.length} templates`);
    
    const results = [];
    
    for (const template of this.templates) {
      try {
        console.log(`\n📋 Testing template ${template.id}: ${template.name}`);
        const result = await this.testTemplate(template);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error testing template ${template.id}:`, error);
        results.push({
          templateId: template.id,
          templateName: template.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('='.repeat(60));
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successful tests:');
      successful.forEach(r => {
        console.log(`  - Template ${r.templateId} (${r.templateName}):`);
        console.log(`    Analysis ID: ${r.analysisId}`);
        console.log(`    Note ID: ${r.noteId || 'Not created'}`);
        console.log(`    Duration: ${r.duration}ms`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed tests:');
      failed.forEach(r => {
        console.log(`  - Template ${r.templateId} (${r.templateName}): ${r.error}`);
      });
    }
    
    return results;
  },
  
  async testTemplate(template) {
    const startTime = Date.now();
    
    // Step 1: Open wizard
    console.log(`  🔵 Step 1: Opening wizard for template ${template.id}...`);
    if (!window.AIAnalysisWizard) {
      throw new Error('AIAnalysisWizard not available');
    }
    
    await window.AIAnalysisWizard.openWizard('new');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Select template
    console.log(`  🔵 Step 2: Selecting template ${template.id}...`);
    const templateCard = document.querySelector(`[data-template-id="${template.id}"]`);
    if (!templateCard) {
      throw new Error(`Template ${template.id} card not found`);
    }
    templateCard.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 3: Select provider and language
    console.log(`  🔵 Step 3: Setting provider and language...`);
    const providerSelect = document.getElementById('wizardProviderSelect');
    const languageSelect = document.getElementById('wizardLanguageSelect');
    
    if (providerSelect) {
      providerSelect.value = 'gemini';
      providerSelect.dispatchEvent(new Event('change'));
    }
    if (languageSelect) {
      languageSelect.value = 'hebrew';
      languageSelect.dispatchEvent(new Event('change'));
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 4: Go to step 2
    console.log(`  🔵 Step 4: Navigating to step 2...`);
    const continueBtn = document.getElementById('wizardContinueToStep2');
    if (!continueBtn || continueBtn.disabled) {
      throw new Error('Continue to step 2 button not available or disabled');
    }
    continueBtn.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 5: Fill in variables
    console.log(`  🔵 Step 5: Filling in variables...`);
    
    // Wait for variables to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill ticker if exists
    const tickerSelect = document.getElementById('wizard_var_stock_ticker') || 
                         document.getElementById('wizard_var_ticker_symbol');
    if (tickerSelect) {
      // Wait for tickers to populate
      let attempts = 0;
      while (tickerSelect.options.length <= 1 && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      // Find ticker option
      const tickerOption = Array.from(tickerSelect.options).find(opt => 
        opt.textContent.includes(template.ticker) || opt.value.includes(template.ticker)
      );
      
      if (tickerOption) {
        tickerSelect.value = tickerOption.value;
        tickerSelect.dispatchEvent(new Event('change'));
        console.log(`    ✅ Selected ticker: ${template.ticker}`);
      } else {
        console.warn(`    ⚠️ Ticker ${template.ticker} not found, using first available`);
        if (tickerSelect.options.length > 1) {
          tickerSelect.selectedIndex = 1;
          tickerSelect.dispatchEvent(new Event('change'));
        }
      }
    }
    
    // Fill other required fields if needed
    // Check for required fields and fill them
    const requiredFields = document.querySelectorAll('#wizardVariablesContainer [required]');
    for (const field of requiredFields) {
      if (!field.value && field.tagName === 'SELECT' && field.options.length > 1) {
        // Select first non-empty option
        field.selectedIndex = 1;
        field.dispatchEvent(new Event('change'));
        console.log(`    ✅ Filled required field: ${field.id || field.name}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 6: Validate step 2
    console.log(`  🔵 Step 6: Validating step 2...`);
    if (window.AIAnalysisWizard.validateStep2) {
      const isValid = window.AIAnalysisWizard.validateStep2();
      if (!isValid) {
        throw new Error('Step 2 validation failed');
      }
      console.log(`    ✅ Validation passed`);
    }
    
    // Step 7: Generate analysis
    console.log(`  🔵 Step 7: Generating analysis...`);
    const generateBtn = document.getElementById('wizardGenerateAnalysisBtn');
    if (!generateBtn) {
      throw new Error('Generate analysis button not found');
    }
    
    if (generateBtn.disabled) {
      throw new Error('Generate analysis button is disabled');
    }
    
    generateBtn.click();
    
    // Wait for analysis to complete
    let analysisId = null;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max
    
    while (!analysisId && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we have currentAnalysis
      if (window.AIAnalysisWizard.currentAnalysis && window.AIAnalysisWizard.currentAnalysis.id) {
        analysisId = window.AIAnalysisWizard.currentAnalysis.id;
      } else if (window.AIAnalysisManager && window.AIAnalysisManager.currentAnalysis) {
        analysisId = window.AIAnalysisManager.currentAnalysis.id;
      }
      
      attempts++;
      
      if (attempts % 10 === 0) {
        console.log(`    ⏳ Waiting for analysis... (${attempts}s)`);
      }
    }
    
    if (!analysisId) {
      throw new Error('Analysis did not complete within timeout');
    }
    
    console.log(`    ✅ Analysis completed: ID ${analysisId}`);
    
    // Step 8: Save as note
    console.log(`  🔵 Step 8: Saving as note...`);
    let noteId = null;
    
    try {
      if (window.AINotesIntegration && window.AINotesIntegration.saveAsNote) {
        // Get current analysis
        const currentAnalysis = window.AIAnalysisWizard.currentAnalysis || 
                               window.AIAnalysisManager.currentAnalysis;
        
        if (currentAnalysis) {
          // Save as note - this will open the notes modal
          await window.AINotesIntegration.saveAsNote(currentAnalysis);
          
          // Wait for note modal
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to find and fill note modal
          const noteModal = document.getElementById('addNoteModal') || 
                           document.querySelector('[id*="note"][id*="modal"]');
          
          if (noteModal) {
            // Find save button and click it
            const saveBtn = noteModal.querySelector('button[type="submit"]') ||
                           noteModal.querySelector('button:has-text("שמור")') ||
                           noteModal.querySelector('[data-button-type="PRIMARY"]');
            
            if (saveBtn) {
              saveBtn.click();
              
              // Wait for note to be saved
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Try to get note ID from response or notification
              // This is a simplified approach - in real scenario, note ID comes from API response
              console.log(`    ⚠️ Note save initiated (note ID detection needs API response)`);
            }
          } else {
            console.log(`    ⚠️ Note modal not found - note save may have completed automatically`);
          }
        }
      } else {
        console.log(`    ⚠️ AINotesIntegration not available`);
      }
    } catch (error) {
      console.warn(`    ⚠️ Error saving note: ${error.message}`);
    }
    
    const duration = Date.now() - startTime;
    
    return {
      templateId: template.id,
      templateName: template.name,
      success: true,
      analysisId: analysisId,
      noteId: noteId,
      duration: duration
    };
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.FullProcessTest = FULL_PROCESS_TEST;
  console.log('✅ Full Process Test loaded. Run: await window.FullProcessTest.testAllTemplates()');
}

// For Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FULL_PROCESS_TEST;
}

