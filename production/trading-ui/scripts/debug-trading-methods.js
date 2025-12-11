/**
 * Debug script for Trading Methods loading in AI Analysis
 * Run this in browser console when the modal is open
 */


// ===== FUNCTION INDEX =====

// === Other ===
// - debugTradingMethodsModal() - Debugtradingmethodsmodal

async function debugTradingMethodsModal() {
  console.log('🔍 Starting Trading Methods Debug...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  // 1. Check if select element exists
  console.log('1️⃣ Checking for select element...');
  const select = document.querySelector('#var_modal_technical_indicators');
  if (select) {
    console.log('✅ Select element found:', select.id);
    console.log(`   Options count: ${select.options.length}`);
    console.log(`   Options:`, Array.from(select.options).map(opt => ({ value: opt.value, text: opt.textContent })));
    results.checks.push({ check: 'select_element', status: 'found', optionsCount: select.options.length });
  } else {
    console.log('❌ Select element NOT found');
    results.checks.push({ check: 'select_element', status: 'not_found' });
  }

  // 2. Check ConditionsCRUDManager
  console.log('\n2️⃣ Checking ConditionsCRUDManager...');
  if (window.ConditionsCRUDManager) {
    console.log('✅ ConditionsCRUDManager exists');
    if (typeof window.ConditionsCRUDManager.getTradingMethods === 'function') {
      console.log('✅ getTradingMethods function exists');
      try {
        const methods = await window.ConditionsCRUDManager.getTradingMethods();
        console.log(`✅ Got ${methods?.length || 0} methods from ConditionsCRUDManager`);
        if (methods && methods.length > 0) {
          console.log('   Methods:', methods.map(m => ({ id: m.id, name_he: m.name_he, name_en: m.name_en })));
        }
        results.checks.push({ check: 'conditions_crud_manager', status: 'success', count: methods?.length || 0, methods });
      } catch (error) {
        console.log('❌ Error calling getTradingMethods:', error);
        results.checks.push({ check: 'conditions_crud_manager', status: 'error', error: error.message });
      }
    } else {
      console.log('❌ getTradingMethods function NOT found');
      results.checks.push({ check: 'conditions_crud_manager', status: 'no_method' });
    }
  } else {
    console.log('❌ ConditionsCRUDManager NOT available');
    results.checks.push({ check: 'conditions_crud_manager', status: 'not_available' });
  }

  // 3. Check SelectPopulatorService
  console.log('\n3️⃣ Checking SelectPopulatorService...');
  if (window.SelectPopulatorService) {
    console.log('✅ SelectPopulatorService exists');
    if (window.SelectPopulatorService.populateSelectWithData) {
      console.log('✅ populateSelectWithData exists');
      results.checks.push({ check: 'select_populator', status: 'has_populateSelectWithData' });
    } else {
      console.log('❌ populateSelectWithData NOT found');
      results.checks.push({ check: 'select_populator', status: 'no_populateSelectWithData' });
    }
    if (window.SelectPopulatorService.populateGenericSelect) {
      console.log('✅ populateGenericSelect exists');
      results.checks.push({ check: 'select_populator', status: 'has_populateGenericSelect' });
    } else {
      console.log('❌ populateGenericSelect NOT found');
    }
  } else {
    console.log('❌ SelectPopulatorService NOT available');
    results.checks.push({ check: 'select_populator', status: 'not_available' });
  }

  // 4. Check direct API call
  console.log('\n4️⃣ Testing direct API call...');
  try {
    const response = await fetch('/api/trading-methods/');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful');
      console.log(`   Status: ${data.status}`);
      console.log(`   Methods count: ${data.data?.length || 0}`);
      if (data.data && data.data.length > 0) {
        console.log('   Methods:', data.data.map(m => ({ id: m.id, name_he: m.name_he, name_en: m.name_en })));
      }
      results.checks.push({ check: 'api_call', status: 'success', count: data.data?.length || 0, data: data.data });
    } else {
      console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
      results.checks.push({ check: 'api_call', status: 'failed', statusCode: response.status });
    }
  } catch (error) {
    console.log('❌ API call error:', error);
    results.checks.push({ check: 'api_call', status: 'error', error: error.message });
  }

  // 5. Check AIAnalysisManager
  console.log('\n5️⃣ Checking AIAnalysisManager...');
  if (window.AIAnalysisManager) {
    console.log('✅ AIAnalysisManager exists');
    if (typeof window.AIAnalysisManager.populateTradingMethodsSelect === 'function') {
      console.log('✅ populateTradingMethodsSelect function exists');
      results.checks.push({ check: 'ai_analysis_manager', status: 'has_function' });
      
      // Try to call it manually if select exists
      if (select) {
        console.log('\n6️⃣ Trying to manually call populateTradingMethodsSelect...');
        try {
          await window.AIAnalysisManager.populateTradingMethodsSelect(select);
          console.log('✅ Manual call completed');
          console.log(`   Options after call: ${select.options.length}`);
          console.log('   Options:', Array.from(select.options).map(opt => ({ value: opt.value, text: opt.textContent })));
          results.checks.push({ check: 'manual_call', status: 'success', optionsCount: select.options.length });
        } catch (error) {
          console.log('❌ Manual call error:', error);
          results.checks.push({ check: 'manual_call', status: 'error', error: error.message });
        }
      }
    } else {
      console.log('❌ populateTradingMethodsSelect function NOT found');
      results.checks.push({ check: 'ai_analysis_manager', status: 'no_function' });
    }
  } else {
    console.log('❌ AIAnalysisManager NOT available');
    results.checks.push({ check: 'ai_analysis_manager', status: 'not_available' });
  }

  // 7. Check variable definition
  console.log('\n7️⃣ Checking template variable definition...');
  try {
    const templatesResponse = await fetch('/api/ai-analysis/templates');
    if (templatesResponse.ok) {
      const templatesData = await templatesResponse.json();
      const technicalTemplate = templatesData.data?.find(t => t.name === 'Technical Analysis Deep Dive');
      if (technicalTemplate) {
        const techIndicatorVar = technicalTemplate.variables_json?.variables?.find(v => v.key === 'technical_indicators');
        if (techIndicatorVar) {
          console.log('✅ Found technical_indicators variable');
          console.log('   Variable:', {
            key: techIndicatorVar.key,
            type: techIndicatorVar.type,
            integration: techIndicatorVar.integration,
            options: techIndicatorVar.options
          });
          results.checks.push({ check: 'variable_definition', status: 'found', variable: techIndicatorVar });
        } else {
          console.log('❌ technical_indicators variable NOT found in template');
          results.checks.push({ check: 'variable_definition', status: 'variable_not_found' });
        }
      } else {
        console.log('❌ Technical Analysis template NOT found');
        results.checks.push({ check: 'variable_definition', status: 'template_not_found' });
      }
    }
  } catch (error) {
    console.log('❌ Error checking template:', error);
    results.checks.push({ check: 'variable_definition', status: 'error', error: error.message });
  }

  console.log('\n📊 Debug Summary:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

// Make it globally available
window.debugTradingMethodsModal = debugTradingMethodsModal;

console.log('✅ Debug script loaded! Run: debugTradingMethodsModal()');


