/**
 * Entity Details System - קובץ ייצוא ראשי
 * מערכת דינמית חכמה ומרכזית להצגת דף של ישות ספציפית
 */

console.log('🎯 Entity Details System - מתחיל טעינה...');

// ייבוא המערכת המרכזית
import './entity-details-system/entity-details-system.js';

// ייבוא מודול הבסיס
import './entity-details-system/base-entity-module.js';

// ייבוא מודול פרטי טיקר
import './entity-details-system/ticker-details-module.js';

// אתחול המערכת כשהדף נטען
// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         console.log('🎯 Entity Details System - מתחיל אתחול...');
        
        // בדיקה שהמערכת המרכזית קיימת
        if (!window.EntityDetailsSystem) {
            throw new Error('EntityDetailsSystem לא קיימת');
        }
        
        // אתחול המערכת המרכזית
        await window.EntityDetailsSystem.init();
        
        // בדיקה שהמודול הבסיסי קיים
        if (typeof BaseEntityModule === 'undefined') {
            throw new Error('BaseEntityModule לא קיים');
        }
        
        // בדיקה שהמודול הספציפי קיים
        if (typeof TickerDetailsModule === 'undefined') {
            throw new Error('TickerDetailsModule לא קיים');
        }
        
        // רישום מודול פרטי טיקר
        const tickerModule = new TickerDetailsModule();
        window.EntityDetailsSystem.registerModule('ticker', tickerModule);
        
        console.log('✅ Entity Details System - מאותחל בהצלחה');
        
        // הוספת פונקציה גלובלית לפתיחת פרטי טיקר
        window.openTickerDetails = function(tickerId) {
            console.log('🔍 פתיחת פרטי טיקר:', tickerId);
            window.EntityDetailsSystem.openDetails('ticker', tickerId);
        };
        
        console.log('🔗 פונקציה openTickerDetails זמינה גלובלית');
        
//     } catch (error) {
//         console.error('❌ שגיאה באתחול Entity Details System:', error);
//         console.error('❌ פרטי השגיאה:', error.stack);
//     }
// });

console.log('🎯 Entity Details System - נטען בהצלחה');
