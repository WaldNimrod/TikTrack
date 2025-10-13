/**
 * Actions Menu System
 * Manages hover-based popup menus for table actions
 * 
 * File: trading-ui/scripts/modules/actions-menu-system.js
 * Version: 1.0
 * Created: January 13, 2025
 * 
 * Features:
 * - Pure CSS hover (no JavaScript delays needed)
 * - Auto-positioning (RTL aware)
 * - Material Design
 * - Supports 2-5 buttons dynamically
 * 
 * Usage:
 * System initializes automatically on DOMContentLoaded.
 * No manual initialization needed.
 */

class ActionsMenuSystem {
    constructor() {
        this.init();
    }

    init() {
        console.log('✅ Actions Menu System initialized');
        console.log('   → CSS-based hover (no JavaScript delays)');
        console.log('   → RTL aware positioning');
        console.log('   → Supports 2-5 buttons dynamically');
        
        // מערכת פשוטה - הכל נעשה ב-CSS עם :hover
        // ה-JavaScript רק למקרים מיוחדים (אם צריך positioning דינמי)
        
        // יכול להוסיף event listeners למקרים מיוחדים אם צריך:
        // - מניעת סגירה בלחיצה על כפתור
        // - keyboard navigation
        // - touch events למובייל
        
        this.initAccessibility();
    }
    
    /**
     * אתחול נגישות - keyboard navigation
     */
    initAccessibility() {
        // תמיכה ב-keyboard navigation (Escape לסגירה)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // סגירת כל הפופאפים הפתוחים
                const openPopups = document.querySelectorAll('.actions-menu-popup.active');
                openPopups.forEach(popup => {
                    popup.classList.remove('active');
                });
            }
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.actionsMenuSystem = new ActionsMenuSystem();
    });
} else {
    window.actionsMenuSystem = new ActionsMenuSystem();
}

