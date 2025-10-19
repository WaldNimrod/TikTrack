/**
 * Debug Show Item Details - TikTrack
 * ==================================
 * 
 * בדיקת פונקציית showItemDetails
 */

function debugShowItemDetails() {
    console.clear();
    console.log('🔍 בודק פונקציית showItemDetails...\n');
    
    // בדוק אם יש UnifiedLogDisplay
    if (!window.UnifiedLogDisplay) {
        console.log('❌ UnifiedLogDisplay לא זמין!');
        return;
    }
    
    console.log('✅ UnifiedLogDisplay זמין');
    
    // מצא instance של UnifiedLogDisplay
    const containers = document.querySelectorAll('.unified-log-display');
    if (containers.length === 0) {
        console.log('❌ לא נמצאו instances של UnifiedLogDisplay!');
        return;
    }
    
    console.log(`✅ נמצאו ${containers.length} instances של UnifiedLogDisplay`);
    
    // בדוק אם יש פונקציה showItemDetails
    const container = containers[0];
    const display = container._unifiedLogDisplay;
    
    if (!display) {
        console.log('❌ לא נמצא instance של UnifiedLogDisplay!');
        return;
    }
    
    console.log('✅ נמצא instance של UnifiedLogDisplay');
    console.log(`   showItemDetails: ${typeof display.showItemDetails === 'function' ? '✅' : '❌'}`);
    console.log(`   formatItemDetails: ${typeof display.formatItemDetails === 'function' ? '✅' : '❌'}`);
    
    // נסה לקרוא לפונקציה
    if (typeof display.showItemDetails === 'function') {
        console.log('\n🧪 בודק פונקציית showItemDetails...');
        
        const testItem = {
            id: 'test-123',
            type: 'success',
            title: 'בדיקה',
            message: 'זהו טקסט בדיקה',
            timestamp: Date.now(),
            page: '/test',
            category: 'test'
        };
        
        try {
            console.log('📋 לפני קריאה לפונקציה:');
            console.log('   Item:', testItem);
            
            display.showItemDetails(testItem);
            console.log('✅ פונקציית showItemDetails הופעלה בהצלחה');
        } catch (error) {
            console.log(`❌ שגיאה בפונקציית showItemDetails: ${error.message}`);
            console.log('   Stack:', error.stack);
        }
    }
    
    // בדוק אם יש פונקציה formatItemDetails
    if (typeof display.formatItemDetails === 'function') {
        console.log('\n🧪 בודק פונקציית formatItemDetails...');
        
        const testItem = {
            id: 'test-123',
            type: 'success',
            title: 'בדיקה',
            message: 'זהו טקסט בדיקה',
            timestamp: Date.now(),
            page: '/test',
            category: 'test'
        };
        
        try {
            const formatted = display.formatItemDetails(testItem);
            console.log('✅ פונקציית formatItemDetails עובדת:');
            console.log('   Formatted:', formatted);
        } catch (error) {
            console.log(`❌ שגיאה בפונקציית formatItemDetails: ${error.message}`);
            console.log('   Stack:', error.stack);
        }
    } else {
        console.log('❌ פונקציית formatItemDetails לא קיימת');
    }
}

// הפעל בדיקה
debugShowItemDetails();

// הוסף לגלובל
window.debugShowItemDetails = debugShowItemDetails;

console.log('\n💡 השתמש ב: debugShowItemDetails() לבדיקה חוזרת');
