# דוח בדיקת תלויות וסדר טעינה - חבילות
**תאריך:** 2025-12-03
**גרסה:** 1.0.0
**סטטוס:** ✅ תקין

---

## 📊 סיכום

- **חבילות נבדקו:** 29
- **שגיאות:** 0
- **אזהרות:** 0
- **סה"כ בעיות:** 0

---

---

## 📊 גרף תלויות

### base (loadOrder: 1)

- **תלוי ב:** none
- **תלוי בו:** services, ui-advanced, modules, crud, tag-management, preferences, validation, conditions, external-data, charts, logs, cache, entity-services, helper, system-management, management, dev-tools, filters, advanced-notifications, entity-details, info-summary, tradingview-charts, watch-lists, ai-analysis, init-system, dashboard-widgets, tradingview-widgets

### services (loadOrder: 2)

- **תלוי ב:** base
- **תלוי בו:** ui-advanced, modules, crud, tag-management, preferences, external-data, charts, logs, cache, entity-services, helper, system-management, management, dev-tools, entity-details, info-summary, watch-lists, ai-analysis, init-system, dashboard-widgets

### modules (loadOrder: 2.5)

- **תלוי ב:** base, services
- **תלוי בו:** ui-advanced, tag-management, ai-analysis, init-system, dashboard-widgets, dashboard

### ui-advanced (loadOrder: 3)

- **תלוי ב:** base, services, modules
- **תלוי בו:** tag-management, filters, entity-details, watch-lists, ai-analysis, init-system, dashboard-widgets

### crud (loadOrder: 4)

- **תלוי ב:** base, services
- **תלוי בו:** tag-management, entity-details, watch-lists, init-system

### preferences (loadOrder: 5)

- **תלוי ב:** base, services
- **תלוי בו:** tag-management, entity-details, ai-analysis, init-system, tradingview-widgets

### tag-management (loadOrder: 5.2)

- **תלוי ב:** base, services, modules, ui-advanced, crud, preferences
- **תלוי בו:** none

### validation (loadOrder: 6)

- **תלוי ב:** base
- **תלוי בו:** conditions, init-system, dashboard

### dashboard (loadOrder: 6.1)

- **תלוי ב:** modules, validation
- **תלוי בו:** none

### conditions (loadOrder: 6.5)

- **תלוי ב:** base, validation
- **תלוי בו:** init-system

### external-data (loadOrder: 7)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### charts (loadOrder: 8)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### logs (loadOrder: 9)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### cache (loadOrder: 9.5)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### entity-services (loadOrder: 10)

- **תלוי ב:** base, services
- **תלוי בו:** entity-details, watch-lists, ai-analysis, init-system, dashboard-widgets

### helper (loadOrder: 11)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### system-management (loadOrder: 12)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### management (loadOrder: 13)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### dev-tools (loadOrder: 14)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### filters (loadOrder: 15)

- **תלוי ב:** base, ui-advanced
- **תלוי בו:** none

### advanced-notifications (loadOrder: 16)

- **תלוי ב:** base
- **תלוי בו:** init-system

### entity-details (loadOrder: 17)

- **תלוי ב:** base, services, ui-advanced, crud, preferences, entity-services
- **תלוי בו:** init-system, dashboard-widgets

### info-summary (loadOrder: 18)

- **תלוי ב:** base, services
- **תלוי בו:** init-system

### tradingview-charts (loadOrder: 19)

- **תלוי ב:** base
- **תלוי בו:** init-system

### dashboard-widgets (loadOrder: 19.5)

- **תלוי ב:** base, services, ui-advanced, entity-services, modules, entity-details
- **תלוי בו:** init-system

### watch-lists (loadOrder: 20)

- **תלוי ב:** base, services, ui-advanced, crud, entity-services
- **תלוי בו:** init-system

### ai-analysis (loadOrder: 20.5)

- **תלוי ב:** base, services, ui-advanced, modules, preferences, entity-services
- **תלוי בו:** init-system

### tradingview-widgets (loadOrder: 21)

- **תלוי ב:** base, preferences
- **תלוי בו:** init-system

### init-system (loadOrder: 22)

- **תלוי ב:** base, crud, services, ui-advanced, modules, preferences, validation, conditions, external-data, charts, logs, cache, entity-services, helper, system-management, management, dev-tools, advanced-notifications, entity-details, info-summary, dashboard-widgets, tradingview-widgets, tradingview-charts, watch-lists, ai-analysis
- **תלוי בו:** none

