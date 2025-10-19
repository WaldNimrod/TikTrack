// 🔍 Quick Debug - העתק לקונסולה
console.log('🔍 Quick Header Filters Debug');

// בדיקת אלמנטים
const headerFilters = document.querySelector('.header-filters');
const filtersContainer = document.querySelector('.filters-container');

console.log('header-filters קיים:', !!headerFilters);
console.log('filters-container קיים:', !!filtersContainer);

if (filtersContainer) {
    const styles = window.getComputedStyle(filtersContainer);
    console.log('filters-container styles:', {
        display: styles.display,
        flexDirection: styles.flexDirection,
        alignItems: styles.alignItems,
        flexWrap: styles.flexWrap,
        margin: styles.margin,
        padding: styles.padding
    });
    
    // בדיקת מיקום
    const rect = filtersContainer.getBoundingClientRect();
    console.log('filters-container position:', {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
    });
}

if (headerFilters) {
    const styles = window.getComputedStyle(headerFilters);
    console.log('header-filters styles:', {
        display: styles.display,
        width: styles.width,
        margin: styles.margin,
        padding: styles.padding
    });
    
    const rect = headerFilters.getBoundingClientRect();
    console.log('header-filters position:', {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
    });
}

// בדיקת סגנונות inline
console.log('header-filters inline style:', headerFilters?.getAttribute('style'));
console.log('filters-container inline style:', filtersContainer?.getAttribute('style'));

console.log('✅ Quick debug completed');
