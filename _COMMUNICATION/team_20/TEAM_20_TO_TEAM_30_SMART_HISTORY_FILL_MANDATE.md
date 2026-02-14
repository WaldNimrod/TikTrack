# Team 20 → Team 30: מנדט ביצוע מיידי — Smart History Fill (UI)

**id:** `TEAM_20_TO_TEAM_30_SMART_HISTORY_FILL_MANDATE`  
**from:** Team 20 (Backend)  
**to:** Team 30 (Frontend)  
**date:** 2026-01-31  
**סוג:** **דרישת ביצוע מיידית** — חוסם QA

---

## ⚠️ מנדט

נדרש **ביצוע מיידי** של המשימות להלן. ה-API מוכן ופעיל — חסר רק צד ה-UI.  
**חוסם:** בקשת QA ל־Team 50 עד להשלמה.

---

## משימות — רשימה ברורה (בסדר ביצוע)

### משימה 1 — וידוא הכפתור הקיים
**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`  

**פעולה:** וודא שקרית `doBackfill` היא:
```javascript
await sharedServices.post(`/tickers/${tickerId}/history-backfill`, {});
```
או במפורש: `.../history-backfill?mode=gap_fill`  
**ברירת מחדל = gap_fill** — אין צורך ב־query אם לא מעדיפים.

---

### משימה 2 — ייבוא ושימוש ב־isAdmin
**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`  

**פעולה:**
1. ייבא: `import authService from '../../../cubes/identity/services/auth.js';`
2. בתוך `doCheck`: `const isAdmin = authService.isAdmin();`

**הפנייה:** `ui/src/cubes/identity/services/auth.js` — `authService.isAdmin()` מחזיר true ל־ADMIN | SUPERADMIN

---

### משימה 3 — תנאי הצגת בלוק "הנתונים מלאים"
**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`  

**תנאי — כולם חייבים להתקיים:**
```javascript
const dataComplete = (hist?.row_count ?? 0) >= 250 && hist?.gap_status === 'OK';
const forceReloadBlock = (dataComplete && isAdmin) ? `...` : '';
```

---

### משימה 4 — HTML של בלוק "הנתונים מלאים — לטעון מחדש?"
**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`  

**פעולה:** הוסף בתוך ה־innerHTML של detailEl (ליד backfillBanner):

```html
<p class="data-integrity-force-reload-banner">
  הנתונים מלאים (250 ימים). לטעון מחדש? (יכלול מחיקת כל הנתונים)
  <button type="button" id="tickerDataIntegrityForceReloadBtn" class="data-integrity-force-reload-btn" data-ticker-id="${tickerId}">טען מחדש (מחיקה)</button>
</p>
```

**הצג רק כאשר:** `dataComplete && isAdmin`

---

### משימה 5 — דיאלוג אישור
**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`  

**פעולה:** לפני קריאת force_reload — `confirm()` או דיאלוג מודאלי:

```javascript
const confirmed = window.confirm('פעולה זו מוחקת את כל נתוני ההיסטוריה וטוענת מחדש. להמשיך?');
if (!confirmed) return;
```

---

### משימה 6 — פונקציה doForceReload + קריאה ל־API
**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`  

**פעולה:** הוסף פונקציה:

```javascript
async function doForceReload(tickerId) {
  if (!tickerId) return;
  if (!window.confirm('פעולה זו מוחקת את כל נתוני ההיסטוריה וטוענת מחדש. להמשיך?')) return;
  const btn = document.getElementById('tickerDataIntegrityForceReloadBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'טוען מחדש...'; }
  try {
    await sharedServices.init();
    await sharedServices.post(`/tickers/${tickerId}/history-backfill?mode=force_reload`, {});
    if (btn) btn.textContent = 'הושלם';
    doCheck();
  } catch (e) {
    const status = e?.status ?? e?.code;
    const msg = status === 403 ? 'דורש הרשאת Admin' : (e?.message ?? 'שגיאה');
    if (btn) { btn.disabled = false; btn.textContent = 'טען מחדש (מחיקה)'; }
    detailEl.insertAdjacentHTML('beforeend', `<p class="data-integrity-error">${msg}</p>`);
  }
}
```

**קריאה:** `POST /tickers/${tickerId}/history-backfill?mode=force_reload`

**וידוא:** `sharedServices.post()` תומך ב־query string — אם לא, העבר:  
`sharedServices.post(\`/tickers/${tickerId}/history-backfill\`, {}, { params: { mode: 'force_reload' } })`  
(בהתאם לממשק הקיים)

---

### משימה 7 — רישום handler לכפתור force_reload
**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`  

**פעולה:** הרחב את ה־addEventListener הקיים (או הוסף handler):

```javascript
const forceBtn = e.target.closest('#tickerDataIntegrityForceReloadBtn');
if (forceBtn) {
  const id = forceBtn.dataset.tickerId || selectEl.value?.trim();
  if (id) doForceReload(id);
  return;
}
```

---

## סיכום — 7 משימות

| # | משימה | קובץ | חובה |
|---|--------|------|------|
| 1 | וידוא doBackfill — gap_fill (ברירת מחדל) | tickersDataIntegrityInit.js | ✓ |
| 2 | isAdmin — getAuthService().isAdmin() | tickersDataIntegrityInit.js | ✓ |
| 3 | תנאי: dataComplete && isAdmin | tickersDataIntegrityInit.js | ✓ |
| 4 | בלוק HTML "הנתונים מלאים" + כפתור | tickersDataIntegrityInit.js | ✓ |
| 5 | confirm() לפני force_reload | tickersDataIntegrityInit.js | ✓ |
| 6 | doForceReload() + post ?mode=force_reload | tickersDataIntegrityInit.js | ✓ |
| 7 | handler לכפתור Force Reload | tickersDataIntegrityInit.js | ✓ |

---

## חוזה API (לבדיקה)

| קריאה | תוצאה |
|-------|--------|
| `POST .../history-backfill` | gap_fill (ברירת מחדל) |
| `POST .../history-backfill?mode=force_reload` + Admin | 200 |
| `POST .../history-backfill?mode=force_reload` + User | **403** → "דורש הרשאת Admin" |

---

## דיווח השלמה

לאחר ביצוע — דווח ל־Team 10 / Team 20:
- **קובץ:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_20_SMART_HISTORY_FILL_UI_COMPLETE.md`
- **תוכן:** פירוט משימות שבוצעו + Evidence (שורות קוד / screenshots)

---

**log_entry | TEAM_20 | TO_TEAM_30 | SMART_HISTORY_FILL_MANDATE | IMMEDIATE | 2026-01-31**
