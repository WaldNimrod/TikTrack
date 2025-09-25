/**
 * Executions Page Initializer
 * ===========================
 * 
 * Initializes the unified header system and modal configurations for executions page
 */

console.log('🔄 Executions initializer loaded');

// אתחול מערכת הכותרת החדשה
document.addEventListener("DOMContentLoaded", () => {
    console.log("🔄 Initializing unified header system...");
    
    // מערכת הכותרת מאותחלת אוטומטית על ידי header-system.js
    console.log("✅ Header system initialized by header-system.js");
    
    if (window.filterSystem) {
        window.filterSystem.initialize();
    }

    // וידוא שהמודולים נסגרים בלחיצה על הרקע
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // הוספת data-bs-backdrop אם לא קיים
        if (!modal.hasAttribute('data-bs-backdrop')) {
            modal.setAttribute('data-bs-backdrop', 'true');
        }
        
        // הוספת data-bs-keyboard אם לא קיים
        if (!modal.hasAttribute('data-bs-keyboard')) {
            modal.setAttribute('data-bs-keyboard', 'true');
        }

        // הוספת event listener לסגירה בלחיצה על הרקע
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });
    });

    console.log('✅ מודולים הוגדרו לסגירה בלחיצה על הרקע');
});

