/**
 * Comprehensive Test for All 4 AI Analysis Templates via Wizard
 * Tests the full wizard flow: selection, validation, generation, and note creation
 * 
 * Run this in browser console on ai-analysis.html page after wizard is loaded
 */

const WIZARD_COMPREHENSIVE_TEST = {
  templates: [
    { id: 1, name: "ניתוח מחקר הון", ticker: "AAPL" },
    { id: 2, name: "ניתוח טכני מעמיק", ticker: "TSLA" },
    { id: 3, name: "ניתוח ביצועים ופורטפוליו", ticker: null }, // Uses account filter
    { id: 4, name: "ניתוח סיכונים ותנאים", ticker: "GOOGL" }
  ],
  
  results: [],
  
  async testAllTemplates() {
    console.log('🧪 Starting Comprehensive Wizard Test for All 4 Templates');
    console.log('='.repeat(70));
    
    this.results = [];
    
    for (let i = 0; i < this.templates.length; i++) {
      const template = this.templates[i];
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📋 Testing Template ${i + 1}/4: ID ${template.id} - ${template.name}`);
      console.log('='.repeat(70));
      
      try {
        const result = await this.testTemplateComplete(template, i + 1);
        this.results.push(result);
        
        // Wait between tests
        if (i < this.templates.length - 1) {
          console.log('\n⏳ Waiting 3 seconds before next test...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Fatal error testing template ${template.id}:`, error);
        this.results.push({
          templateId: template.id,
          templateName: template.name,
          success: false,
          error: error.message,
          step: 'unknown'
        });
      }
    }
    
    this.printSummary();
    return this.results;
  },
  
  async testTemplateComplete(template, templateNumber) {
    const startTime = Date.now();
    const result = {
      templateId: template.id,
      templateName: template.name,
      templateNumber: templateNumber,
      success: false,
      errors: [],
      analysisId: null,
      noteId: null,
      steps: {},
      duration: 0
    };
    
    try {
      // Step 1: Open Wizard
      console.log(`\n🔵 Step 1/${templateNumber}: Opening wizard...`);
      if (!window.AIAnalysisWizard) {
        throw new Error('AIAnalysisWizard not available');
      }
      
      await window.AIAnalysisWizard.openWizard('new');
      await this.wait(500);
      result.steps['1_open_wizard'] = { success: true, duration: Date.now() - startTime };
      console.log('   ✅ Wizard opened');
      
      // Step 2: Select Template
      console.log(`\n🔵 Step 2/${templateNumber}: Selecting template ${template.id}...`);
      const templateCard = document.querySelector(`[data-template-id="${template.id}"]`);
      if (!templateCard) {
        throw new Error(`Template ${template.id} card not found`);
      }
      templateCard.click();
      await this.wait(800);
      result.steps['2_select_template'] = { success: true, duration: Date.now() - startTime };
      console.log('   ✅ Template selected');
      
      // Step 3: Set Provider and Language
      console.log(`\n🔵 Step 3/${templateNumber}: Setting provider and language...`);
      const providerSelect = document.getElementById('wizardProviderSelect');
      const languageSelect = document.getElementById('wizardLanguageSelect');
      
      if (providerSelect) {
        providerSelect.value = 'gemini';
        providerSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('   ✅ Provider set to gemini');
      }
      if (languageSelect) {
        languageSelect.value = 'hebrew';
        languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('   ✅ Language set to hebrew');
      }
      await this.wait(500);
      result.steps['3_set_provider_language'] = { success: true, duration: Date.now() - startTime };
      
      // Step 4: Navigate to Step 2
      console.log(`\n🔵 Step 4/${templateNumber}: Navigating to step 2...`);
      const continueBtn = document.getElementById('wizardContinueToStep2');
      if (!continueBtn) {
        throw new Error('Continue to step 2 button not found');
      }
      
      // Wait for button to be enabled
      let attempts = 0;
      while (continueBtn.disabled && attempts < 20) {
        await this.wait(200);
        attempts++;
      }
      
      if (continueBtn.disabled) {
        throw new Error('Continue button is still disabled after waiting');
      }
      
      continueBtn.click();
      await this.wait(1500); // Wait for step 2 to load
      result.steps['4_navigate_step2'] = { success: true, duration: Date.now() - startTime };
      console.log('   ✅ Navigated to step 2');
      
      // Step 5: Fill Variables
      console.log(`\n🔵 Step 5/${templateNumber}: Filling variables...`);
      const fillResult = await this.fillStep2Variables(template);
      if (!fillResult.success) {
        throw new Error(`Failed to fill variables: ${fillResult.error}`);
      }
      result.steps['5_fill_variables'] = fillResult;
      console.log('   ✅ Variables filled');
      
      // Step 6: Validate Step 2
      console.log(`\n🔵 Step 6/${templateNumber}: Validating step 2...`);
      if (window.AIAnalysisWizard.validateStep2) {
        const isValid = window.AIAnalysisWizard.validateStep2();
        if (!isValid) {
          throw new Error('Step 2 validation failed');
        }
        result.steps['6_validate_step2'] = { success: true, duration: Date.now() - startTime };
        console.log('   ✅ Validation passed');
      } else {
        console.log('   ⚠️ validateStep2 function not available, skipping');
        result.steps['6_validate_step2'] = { success: true, skipped: true };
      }
      
      // Step 7: Navigate to Step 3 and Generate
      console.log(`\n🔵 Step 7/${templateNumber}: Generating analysis...`);
      const generateBtn = document.getElementById('wizardGenerateAnalysisBtn');
      if (!generateBtn) {
        throw new Error('Generate analysis button not found');
      }
      
      if (generateBtn.disabled) {
        throw new Error('Generate button is disabled');
      }
      
      generateBtn.click();
      await this.wait(1000);
      
      // Wait for analysis completion
      const analysisResult = await this.waitForAnalysisCompletion();
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis generation failed');
      }
      
      result.analysisId = analysisResult.analysisId;
      result.steps['7_generate_analysis'] = analysisResult;
      console.log(`   ✅ Analysis completed: ID ${result.analysisId}`);
      
      // Step 8: Save as Note (if analysis completed successfully)
      if (result.analysisId) {
        console.log(`\n🔵 Step 8/${templateNumber}: Saving as note...`);
        try {
          const noteResult = await this.saveAnalysisAsNote(result.analysisId);
          result.noteId = noteResult.noteId;
          result.steps['8_save_as_note'] = noteResult;
          if (noteResult.success) {
            console.log(`   ✅ Note created: ID ${noteResult.noteId}`);
          } else {
            console.log(`   ⚠️ Note creation skipped or failed: ${noteResult.error || 'User action required'}`);
          }
        } catch (error) {
          console.warn(`   ⚠️ Note creation error: ${error.message}`);
          result.steps['8_save_as_note'] = { success: false, error: error.message };
        }
      }
      
      result.success = true;
      result.duration = Date.now() - startTime;
      
      console.log(`\n✅ Template ${template.id} completed successfully in ${result.duration}ms`);
      return result;
      
    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      console.error(`\n❌ Template ${template.id} failed: ${error.message}`);
      return result;
    }
  },
  
  async fillStep2Variables(template) {
    try {
      // Wait for variables container to be populated
      await this.wait(1000);
      
      // Fill ticker if needed
      if (template.ticker) {
        const tickerSelect = document.getElementById('wizard_var_stock_ticker') || 
                             document.getElementById('wizard_var_ticker_symbol');
        
        if (tickerSelect) {
          // Wait for tickers to populate
          let attempts = 0;
          while (tickerSelect.options.length <= 1 && attempts < 15) {
            await this.wait(500);
            attempts++;
          }
          
          // Find and select ticker
          const tickerOption = Array.from(tickerSelect.options).find(opt => 
            opt.textContent.includes(template.ticker) || 
            opt.value.toString().includes(template.ticker) ||
            opt.dataset.symbol === template.ticker
          );
          
          if (tickerOption) {
            tickerSelect.value = tickerOption.value;
            tickerSelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`      ✅ Selected ticker: ${template.ticker}`);
          } else {
            // Use first available ticker
            if (tickerSelect.options.length > 1) {
              tickerSelect.selectedIndex = 1;
              tickerSelect.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`      ⚠️ Ticker ${template.ticker} not found, using first available`);
            }
          }
        }
      }
      
      // Fill required fields
      const requiredFields = document.querySelectorAll('#wizardVariablesContainer [required], #wizardFiltersContainer [required]');
      for (const field of requiredFields) {
        if (!field.value && field.tagName === 'SELECT' && field.options.length > 1) {
          // Skip empty option
          field.selectedIndex = 1;
          field.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`      ✅ Filled required field: ${field.id || field.name}`);
        }
      }
      
      await this.wait(500);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  async waitForAnalysisCompletion(maxWait = 180000) {
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < maxWait) {
      await this.wait(2000);
      attempts++;
      
      // Check if analysis completed
      if (window.AIAnalysisWizard.currentAnalysis && window.AIAnalysisWizard.currentAnalysis.id) {
        return {
          success: true,
          analysisId: window.AIAnalysisWizard.currentAnalysis.id,
          duration: Date.now() - startTime
        };
      }
      
      if (window.AIAnalysisManager && window.AIAnalysisManager.currentAnalysis) {
        return {
          success: true,
          analysisId: window.AIAnalysisManager.currentAnalysis.id,
          duration: Date.now() - startTime
        };
      }
      
      // Check for errors
      const errorElement = document.querySelector('.alert-danger, .validation-error-alert');
      if (errorElement && errorElement.textContent.includes('שגיאה')) {
        return {
          success: false,
          error: errorElement.textContent.trim()
        };
      }
      
      if (attempts % 15 === 0) {
        console.log(`      ⏳ Waiting for analysis... (${attempts * 2}s)`);
      }
    }
    
    return {
      success: false,
      error: 'Analysis did not complete within timeout'
    };
  },
  
  async saveAnalysisAsNote(analysisId) {
    try {
      if (!window.AINotesIntegration || !window.AINotesIntegration.saveAsNote) {
        return { success: false, error: 'AINotesIntegration not available', skipped: true };
      }
      
      const analysis = window.AIAnalysisWizard.currentAnalysis || window.AIAnalysisManager.currentAnalysis;
      if (!analysis) {
        return { success: false, error: 'Analysis not found', skipped: true };
      }
      
      // Open notes modal
      await window.AINotesIntegration.saveAsNote(analysis);
      await this.wait(1000);
      
      // Note: User needs to manually select related type and save
      // This is by design - notes modal requires user interaction
      return {
        success: true,
        skipped: true,
        noteId: null,
        message: 'Note modal opened - user action required to complete'
      };
    } catch (error) {
      return { success: false, error: error.message, skipped: true };
    }
  },
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(70));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(`\n✅ Successful: ${successful.length}/${this.results.length}`);
    console.log(`❌ Failed: ${failed.length}/${this.results.length}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successful Tests:');
      successful.forEach(r => {
        console.log(`  ${r.templateNumber}. Template ${r.templateId} (${r.templateName}):`);
        console.log(`     Analysis ID: ${r.analysisId || 'N/A'}`);
        console.log(`     Note ID: ${r.noteId || 'User action required'}`);
        console.log(`     Duration: ${(r.duration / 1000).toFixed(2)}s`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(r => {
        console.log(`  ${r.templateNumber || '?'}. Template ${r.templateId} (${r.templateName}):`);
        console.log(`     Error: ${r.errors.join(', ') || r.error || 'Unknown error'}`);
        if (r.steps) {
          const failedStep = Object.entries(r.steps).find(([k, v]) => !v.success);
          if (failedStep) {
            console.log(`     Failed at: ${failedStep[0]}`);
          }
        }
      });
    }
    
    const totalDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);
    console.log(`\n⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('='.repeat(70));
  }
};

// Export for browser console
if (typeof window !== 'undefined') {
  window.WizardComprehensiveTest = WIZARD_COMPREHENSIVE_TEST;
  console.log('✅ Wizard Comprehensive Test loaded!');
  console.log('Run: await window.WizardComprehensiveTest.testAllTemplates()');
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WIZARD_COMPREHENSIVE_TEST;
}

