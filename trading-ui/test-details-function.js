/**
 * Test Details Function - TikTrack
 * ================================
 * 
 * בדיקת פונקציית הפרטים
 */

function testDetailsFunction() {
    console.clear();
    console.log('🔍 בודק פונקציית הפרטים...\n');
    
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
            display.showItemDetails(testItem);
            console.log('✅ פונקציית showItemDetails הופעלה בהצלחה');
        } catch (error) {
            console.log(`❌ שגיאה בפונקציית showItemDetails: ${error.message}`);
        }
    }
    
    // בדוק אם יש פונקציה formatItemDetails
    if (typeof display.formatItemDetails === 'function') {
        console.log('✅ פונקציית formatItemDetails קיימת');
        
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
            console.log(formatted);
        } catch (error) {
            console.log(`❌ שגיאה בפונקציית formatItemDetails: ${error.message}`);
        }
    } else {
        console.log('❌ פונקציית formatItemDetails לא קיימת');
    }
}

// הפעל בדיקה
testDetailsFunction();

// הוסף לגלובל
window.testDetailsFunction = testDetailsFunction;

console.log('\n💡 השתמש ב: testDetailsFunction() לבדיקה חוזרת');
