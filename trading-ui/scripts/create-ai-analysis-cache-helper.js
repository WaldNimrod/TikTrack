/**
 * Helper script to create cache entries for AI analysis responses
 * Run this in browser console after creating analyses to simulate cache
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Run: createAIAnalysisCacheEntries()
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - createAIAnalysisCacheEntries() - Createaianalysiscacheentries

async function createAIAnalysisCacheEntries() {
  console.log('🔧 Creating AI Analysis cache entries...');
  
  if (!window.UnifiedCacheManager) {
    console.error('❌ UnifiedCacheManager not available');
    return;
  }

  // Get all completed analyses
  try {
    const response = await fetch('/api/ai-analysis/history', { });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch history');
      return;
    }
    
    const data = await response.json();
    if (data.status !== 'success' || !data.data) {
      console.error('❌ Invalid response from API');
      return;
    }
    
    const analyses = data.data.filter(a => a.status === 'completed');
    console.log(`📊 Found ${analyses.length} completed analyses`);
    
    let cachedCount = 0;
    for (const analysis of analyses) {
      if (!analysis.id) continue;
      
      // Check if already has response_text (from DB or previous cache)
      // If not, create a sample response
      let responseText = analysis.response_text;
      
      if (!responseText) {
        // Create sample response
        const variables = analysis.variables_json || {};
        responseText = `# ניתוח מחקר מניות - ${variables.stock_ticker || 'Unknown'}

## 1. ניתוח פונדמנטלי

### צמיחת הכנסות
החברה מציגה צמיחה יציבה בהכנסות עם מגמה חיובית.

### רווחיות
הרווחיות הגולמית והנקייה מציגות שיפור משמעותי.

## 2. אימות תזה

### טיעונים תומכים
1. ביצועים פיננסיים חזקים
2. מיקום תחרותי מוביל
3. צמיחה עתידית מבטיחה

### סיכונים מרכזיים
1. תנודתיות בשוק
2. לחץ תחרותי

## 3. סיכום השקעה

**המלצה:** קנייה
**רמת ביטחון:** גבוהה
**תקופת זמן:** 6-12 חודשים
`;
      }
      
      // Save to cache
      const cacheKey = `ai-analysis-response-${analysis.id}`;
      await window.UnifiedCacheManager.save(cacheKey, {
        response_text: responseText,
        response_json: analysis.response_json || null,
        cached_at: new Date().toISOString()
      }, {
        ttl: 7200000, // 2 hours
        layer: 'indexedDB',
        compress: true
      });
      
      cachedCount++;
      console.log(`✅ Cached analysis ID ${analysis.id}`);
    }
    
    console.log(`\n✅ Successfully cached ${cachedCount} analyses`);
    console.log('💡 Now reload the page to see the cache indicators');
    
  } catch (error) {
    console.error('❌ Error creating cache entries:', error);
  }
}

// Make it available globally
window.createAIAnalysisCacheEntries = createAIAnalysisCacheEntries;

console.log('✅ Helper script loaded. Run: createAIAnalysisCacheEntries()');






















