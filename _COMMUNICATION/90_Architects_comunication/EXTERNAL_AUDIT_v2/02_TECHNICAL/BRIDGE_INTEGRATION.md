# 🔗 Bridge Integration - HTML Shell ↔ React Content
**project_domain:** TIKTRACK

**תאריך:** 2026-02-04  
**סטטוס:** ✅ **COMPLETE**

---

## 📢 Executive Summary

יישום Bridge Integration לתקשורת דו-כיוונית בין HTML Shell ל-React Content.

---

## 🏗️ ארכיטקטורה

### **Bridge (HTML Shell):**
- **מיקום:** `ui/src/components/core/phoenixFilterBridge.js`
- **תפקיד:** ניהול מצב פילטרים ב-HTML Shell
- **API:** `window.PhoenixBridge`

### **React Context:**
- **מיקום:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
- **תפקיד:** ניהול מצב פילטרים ב-React Content
- **חיבור:** Listener ל-`phoenix-filter-change` event

---

## 🔄 Flow

### **1. HTML Shell → React:**
```
Bridge dispatches 'phoenix-filter-change' event
  ↓
React Context listens to event
  ↓
React Context updates filters state
```

### **2. React → HTML Shell:**
```
React Context calls window.PhoenixBridge.setFilter()
  ↓
Bridge updates its state
  ↓
Bridge triggers UI updates
```

---

## 📋 קוד

### **Bridge Dispatch:**
```javascript
// phoenixFilterBridge.js
window.PhoenixBridge.setFilter = function(key, value) {
  this.state.filters[key] = value;
  
  // Dispatch Custom Event
  window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
    detail: { key, value, filters: { ...this.state.filters } }
  }));
};
```

### **React Context Listen:**
```javascript
// PhoenixFilterContext.jsx
useEffect(() => {
  if (typeof window !== 'undefined' && window.PhoenixBridge) {
    const handleBridgeFilterChange = (event) => {
      if (event.detail && event.detail.filters) {
        const bridgeFilters = event.detail.filters;
        setFiltersState(prevFilters => ({
          ...prevFilters,
          ...bridgeFilters
        }));
      }
    };

    window.addEventListener('phoenix-filter-change', handleBridgeFilterChange);
    
    return () => {
      window.removeEventListener('phoenix-filter-change', handleBridgeFilterChange);
    };
  }
}, []);
```

### **React Context Sync:**
```javascript
// PhoenixFilterContext.jsx
const setFilter = useCallback((key, value) => {
  setFiltersState((prevFilters) => {
    const newFilters = { ...prevFilters, [key]: value };

    // Sync to Bridge when filter changes (from React side)
    if (typeof window !== 'undefined' && window.PhoenixBridge && window.PhoenixBridge.setFilter) {
      window.PhoenixBridge.setFilter(key, value);
    }

    return newFilters;
  });
}, []);
```

---

## ✅ תכונות

1. **Bidirectional Sync:** תקשורת דו-כיוונית
2. **Event-Driven:** שימוש ב-Custom Events
3. **Initial State Sync:** סנכרון מצב התחלתי מ-Bridge
4. **Cleanup:** הסרת listeners ב-cleanup

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** ✅ **COMPLETE**
