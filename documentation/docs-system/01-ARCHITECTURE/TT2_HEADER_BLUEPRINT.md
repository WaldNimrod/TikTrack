# 🏗️ Header & Shell Spec — SSOT
**project_domain:** TIKTRACK

**id:** `TT2_HEADER_BLUEPRINT`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-12  
**version:** v2.0 (הרחבה: Header Loader, Persistence, Unified Header — מקודם מבאץ' 2)

---

## 1. עקרונות עיצוב (Layout)

- 2 Rows layout.
- Global Filter sync.
- Centered Roll-up Toggle.
- Entity context aware.

---

## 2. מקור אמת יחיד — Unified Header

**החלטה אדריכלית:** קובץ HTML **יחיד** לכל המערכת.

| פריט | ערך |
|------|-----|
| **קובץ HTML** | `ui/src/components/core/unified-header.html` |
| **טעינה דינמית** | `ui/src/components/core/header-loader.js` |

**תכונות:**
- טעינת Header דינמית מ-`unified-header.html`.
- הזרקה ל-`<body>` לפני `.page-wrapper`.
- מניעת כפילויות.
- דומה ל-Footer Loader (אפס למידה).

---

## 3. Header Loader (דומה ל-Footer Loader)

- **header-loader.js** — טוען את `unified-header.html` ומזריק ל-DOM.
- **אין** Header מוטמע בעמודים — רק Loader.
- כל עמודי HTML מעודכנים: הסרת Header מוטמע, הוספת Loaders.

---

## 4. Header Persistence (התמדה)

- **עקרון:** Header **תמיד** קיים בכל עמוד שאינו Open (לא בעמודי Auth Open).
- **אין Header בתוך Containers:** מניעת כפילות ו-SSR כפול.
- **Path נעול:** `unified-header.html` בלבד (Team 30/40).

---

## 5. Phoenix Dynamic Bridge (v2.0)

**קובץ:** `ui/src/components/core/phoenix-filter-bridge.js`

| תכונה | תיאור |
|--------|--------|
| **Registry** | `window.PhoenixBridge` — אובייקט גלובלי |
| **Dynamic Data Injection** | `updateOptions(key, data)` — עדכון אפשרויות פילטרים |
| **URL Sync** | `syncWithUrl()` — סנכרון פילטרים עם URL Params |
| **Session Storage** | שמירת מצב ב-`sessionStorage` |
| **Cross-Page** | טעינת מצב במעבר בין עמודים |

**דוגמה:**
```javascript
// React: עדכון חשבונות
window.PhoenixBridge.updateOptions('accounts', accountsData);
// Vanilla: Header מקשיב ומעדכן UI דינמית
```

---

## 6. רפרנסים

- החלטה תקשורת (ארכיון): `_COMMUNICATION/team_10/TEAM_10_HEADER_ARCHITECTURE_DECISION_SUMMARY.md` → ארכיון 2026-02-12.
- Auth Guards ו-Persistence: [TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md](./TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md).

---

**Team 10 (The Gateway)**  
**log_entry | TT2_HEADER_BLUEPRINT | EXPANDED_V2 | 2026-02-12**
