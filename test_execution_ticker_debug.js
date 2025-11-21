/**
 * קוד בדיקה לבעיית טיקרים במודול ביצועים
 * העתק והדבק בקונסול הדפדפן
 */

async function debugExecutionTicker() {
    console.log('🔍 ===== בדיקת טיקרים במודול ביצועים =====');
    
    // 1. בדיקת שדה הטיקר
    const tickerSelect = document.getElementById('executionTicker');
    console.log('\n1️⃣ בדיקת שדה executionTicker:');
    if (!tickerSelect) {
        console.error('❌ שדה executionTicker לא נמצא!');
        return;
    }
    console.log('✅ שדה executionTicker נמצא');
    console.log('   - מספר אופציות:', tickerSelect.options.length);
    console.log('   - ערך נבחר:', tickerSelect.value);
    console.log('   - אופציות:', Array.from(tickerSelect.options).map(opt => ({
        value: opt.value,
        text: opt.text
    })));
    
    // 2. בדיקת tickerService
    console.log('\n2️⃣ בדיקת tickerService:');
    if (!window.tickerService) {
        console.error('❌ window.tickerService לא זמין!');
        return;
    }
    console.log('✅ window.tickerService זמין');
    console.log('   - getTickersWithOpenOrClosedTradesAndPlans:', typeof window.tickerService.getTickersWithOpenOrClosedTradesAndPlans);
    console.log('   - updateTickerSelect:', typeof window.tickerService.updateTickerSelect);
    console.log('   - getTickers:', typeof window.tickerService.getTickers);
    
    // 3. טעינת טיקרים רלוונטיים
    console.log('\n3️⃣ טעינת טיקרים רלוונטיים:');
    try {
        const relevantTickers = await window.tickerService.getTickersWithOpenOrClosedTradesAndPlans({
            useCache: true
        });
        console.log('✅ נטענו טיקרים רלוונטיים:', relevantTickers.length);
        console.log('   - טיקרים:', relevantTickers.map(t => ({
            id: t.id,
            symbol: t.symbol,
            name: t.name
        })));
        
        // 4. בדיקת כל הטיקרים
        console.log('\n4️⃣ בדיקת כל הטיקרים:');
        const allTickers = await window.tickerService.getTickers();
        console.log('✅ כל הטיקרים:', allTickers.length);
        console.log('   - טיקרים:', allTickers.slice(0, 5).map(t => ({
            id: t.id,
            symbol: t.symbol,
            name: t.name
        })));
        
        // 5. בדיקת טריידים ותכנונים
        console.log('\n5️⃣ בדיקת טריידים ותכנונים:');
        const trades = await window.tickerService.getTrades();
        const plans = await window.tickerService.getTradePlans();
        console.log('   - טריידים:', trades.length);
        console.log('   - תכנונים:', plans.length);
        
        // טריידים פתוחים/סגורים
        const openOrClosedTrades = trades.filter(t => 
            t.status === 'open' || t.status === 'closed'
        );
        console.log('   - טריידים פתוחים/סגורים:', openOrClosedTrades.length);
        
        // תכנונים פתוחים/סגורים
        const openOrClosedPlans = plans.filter(p => 
            p.status === 'open' || p.status === 'closed'
        );
        console.log('   - תכנונים פתוחים/סגורים:', openOrClosedPlans.length);
        
        // 6. בדיקת טיקרים עם טריידים/תכנונים
        console.log('\n6️⃣ בדיקת טיקרים עם טריידים/תכנונים:');
        const tickerIdsWithTrades = new Set(openOrClosedTrades.map(t => t.ticker_id));
        const tickerIdsWithPlans = new Set(openOrClosedPlans.map(p => p.ticker_id));
        const allRelevantTickerIds = new Set([...tickerIdsWithTrades, ...tickerIdsWithPlans]);
        console.log('   - טיקרים עם טריידים:', Array.from(tickerIdsWithTrades));
        console.log('   - טיקרים עם תכנונים:', Array.from(tickerIdsWithPlans));
        console.log('   - כל הטיקרים הרלוונטיים:', Array.from(allRelevantTickerIds));
        
        // 7. ניסיון עדכון ידני
        console.log('\n7️⃣ ניסיון עדכון ידני של ה-select:');
        if (relevantTickers.length > 0) {
            console.log('   - מנסה לעדכן את ה-select עם', relevantTickers.length, 'טיקרים...');
            if (window.tickerService.updateTickerSelect) {
                window.tickerService.updateTickerSelect('executionTicker', relevantTickers, 'בחר טיקר...');
                console.log('✅ עדכון ה-select בוצע');
                
                // בדיקה אחרי עדכון
                const updatedSelect = document.getElementById('executionTicker');
                console.log('   - מספר אופציות אחרי עדכון:', updatedSelect.options.length);
                console.log('   - אופציות:', Array.from(updatedSelect.options).map(opt => ({
                    value: opt.value,
                    text: opt.text
                })));
            } else {
                console.error('❌ updateTickerSelect לא זמין!');
            }
        } else {
            console.warn('⚠️ אין טיקרים רלוונטיים - מנסה עם כל הטיקרים...');
            if (allTickers.length > 0) {
                window.tickerService.updateTickerSelect('executionTicker', allTickers, 'בחר טיקר...');
                console.log('✅ עדכון ה-select בוצע עם כל הטיקרים');
            }
        }
        
    } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים:', error);
        console.error('   - Stack:', error.stack);
    }
    
    // 8. בדיקת SelectPopulatorService
    console.log('\n8️⃣ בדיקת SelectPopulatorService:');
    if (!window.SelectPopulatorService) {
        console.error('❌ SelectPopulatorService לא זמין!');
    } else {
        console.log('✅ SelectPopulatorService זמין');
        console.log('   - populateTickersSelect:', typeof window.SelectPopulatorService.populateTickersSelect);
    }
    
    // 9. בדיקת ModalManagerV2
    console.log('\n9️⃣ בדיקת ModalManagerV2:');
    if (!window.ModalManagerV2) {
        console.error('❌ ModalManagerV2 לא זמין!');
    } else {
        console.log('✅ ModalManagerV2 זמין');
        const modalInfo = window.ModalManagerV2.getModalInfo('executionsModal');
        console.log('   - מידע על executionsModal:', modalInfo ? 'נמצא' : 'לא נמצא');
    }
    
    console.log('\n✅ ===== סיום בדיקה =====');
}

// הרצה אוטומטית
debugExecutionTicker();

