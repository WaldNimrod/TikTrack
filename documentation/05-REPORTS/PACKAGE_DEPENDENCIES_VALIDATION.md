# דוח בדיקת תלויות וסדר טעינה - חבילות
**תאריך:** 2025-12-10
**גרסה:** 1.0.0
**סטטוס:** ✅ תקין

---

## 📊 סיכום

- **חבילות נבדקו:** 28
- **שגיאות:** 0
- **אזהרות:** 1
- **סה"כ בעיות:** 1

---

## 5️⃣ כפילויות בסדר טעינה

- Package 'entity-services' has same loadOrder (8) as 'charts'

---

## 📊 גרף תלויות

### base (loadOrder: 1)

- **תלוי ב:** none
- **תלוי בו:** services, ui-advanced, modules, crud, tag-management, preferences, validation, conditions, external-data, charts, logs, cache, entity-services, helper, system-management, management, dev-tools, filters, entity-details, info-summary, tradingview-charts, watch-lists, ai-analysis, init-system, dashboard-widgets, tradingview-widgets

### services (loadOrder: 2)

- **תלוי ב:** base
- **תלוי בו:** ui-advanced, modules, crud, tag-management, preferences, external-data, charts, logs, cache, entity-services, helper, system-management, management, dev-tools, entity-details, info-summary, watch-lists, ai-analysis, dashboard-widgets

### validation (loadOrder: 2.4)

- **תלוי ב:** base
- **תלוי בו:** conditions, dashboard

### modules (loadOrder: 2.5)

- **תלוי ב:** base, services
- **תלוי בו:** ui-advanced, tag-management, ai-analysis, dashboard-widgets, dashboard

### ui-advanced (loadOrder: 3)

- **תלוי ב:** base, services, modules
- **תלוי בו:** tag-management, filters, entity-details, watch-lists, ai-analysis, dashboard-widgets

### crud (loadOrder: 4)

- **תלוי ב:** base, services
- **תלוי בו:** tag-management, entity-details, watch-lists

### preferences (loadOrder: 5)

- **תלוי ב:** base, services
- **תלוי בו:** tag-management, entity-details, ai-analysis, tradingview-widgets

### tag-management (loadOrder: 5.2)

- **תלוי ב:** base, services, modules, ui-advanced, crud, preferences
- **תלוי בו:** none

### dashboard (loadOrder: 6.1)

- **תלוי ב:** modules, validation
- **תלוי בו:** none

### conditions (loadOrder: 6.5)

- **תלוי ב:** base, validation
- **תלוי בו:** none

### external-data (loadOrder: 7)

- **תלוי ב:** base, services
- **תלוי בו:** none

### charts (loadOrder: 8)

- **תלוי ב:** base, services
- **תלוי בו:** none

### entity-services (loadOrder: 8)

- **תלוי ב:** base, services
- **תלוי בו:** entity-details, watch-lists, ai-analysis, dashboard-widgets

### logs (loadOrder: 9)

- **תלוי ב:** base, services
- **תלוי בו:** none

### cache (loadOrder: 9.5)

- **תלוי ב:** base, services
- **תלוי בו:** none

### helper (loadOrder: 11)

- **תלוי ב:** base, services
- **תלוי בו:** none

### system-management (loadOrder: 12)

- **תלוי ב:** base, services
- **תלוי בו:** none

### management (loadOrder: 13)

- **תלוי ב:** base, services
- **תלוי בו:** none

### dev-tools (loadOrder: 14)

- **תלוי ב:** base, services
- **תלוי בו:** none

### filters (loadOrder: 15)

- **תלוי ב:** base, ui-advanced
- **תלוי בו:** none

### entity-details (loadOrder: 17)

- **תלוי ב:** base, services, ui-advanced, crud, preferences, entity-services
- **תלוי בו:** dashboard-widgets

### info-summary (loadOrder: 17.5)

- **תלוי ב:** base, services
- **תלוי בו:** none

### tradingview-charts (loadOrder: 19)

- **תלוי ב:** base
- **תלוי בו:** none

### watch-lists (loadOrder: 20)

- **תלוי ב:** base, services, ui-advanced, crud, entity-services
- **תלוי בו:** dashboard-widgets

### ai-analysis (loadOrder: 20.5)

- **תלוי ב:** base, services, ui-advanced, modules, preferences, entity-services
- **תלוי בו:** none

### dashboard-widgets (loadOrder: 20.6)

- **תלוי ב:** base, services, ui-advanced, entity-services, modules, entity-details, watch-lists
- **תלוי בו:** none

### tradingview-widgets (loadOrder: 21)

- **תלוי ב:** base, preferences
- **תלוי בו:** none

### init-system (loadOrder: 22)

- **תלוי ב:** base
- **תלוי בו:** none

