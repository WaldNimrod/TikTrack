# Team 30 → Team 10: דוח סגירה — בץ 2.5 (ADR-017/018)

**מאת:** Team 30 (Frontend Execution)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** BATCH_2_5_COMPLETIONS_MANDATE.md, ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md

---

## 1. סיכום ביצוע

| # | משימה | סטטוס | קישור לקוד |
|---|--------|--------|-------------|
| 1 | יישור גרסת UI ל־1.0.0 | ✅ הושלם | [package.json](../../ui/package.json) |
| 2 | Redirect Non-Open → Home (ADR-017) | ✅ מאומת | [authGuard.js](../../ui/src/components/core/authGuard.js) |
| 3 | User Icon: Success/Warning, לא שחור | ✅ הושלם | [phoenix-header.css](../../ui/src/styles/phoenix-header.css), [headerLinksUpdater.js](../../ui/src/components/core/headerLinksUpdater.js) |
| 4 | ברוקר "אחר" ADR-018 | ✅ הושלם | [tradingAccountsForm.js](../../ui/src/views/financial/tradingAccounts/tradingAccountsForm.js), [adr015GovernanceMessage.js](../../ui/src/views/financial/shared/adr015GovernanceMessage.js) |

---

## 2. פירוט משימות

### 2.1 יישור גרסת UI ל־1.0.0 ✅

**שינויים:**
- `ui/package.json` — `"version": "2.0.0"` → `"1.0.0"`
- Phoenix-Ver בקבצים: phoenixFilterBridge, sectionToggleHandler, portfolioSummaryToggle, headerFilters, headerDropdown — v2.0.0 → v1.0.0
- unified-header.html, phoenix-components.css — אזכורי v2.0 → v1.0

**קריטריון הצלחה:** אין 2.x בגרסת ה-UI.

---

### 2.2 Redirect לכל משתמש לא מחובר (ADR-017) ✅

**מצב:** authGuard.js מפנה ל־`/` (Home) בכל עמוד שאינו Open (Type C/D).

**קוד:** `ui/src/components/core/authGuard.js` — שורות 278–280, 315–317, 336, 408: `window.location.href = '/'`

**קריטריון הצלחה:** משתמש אנונימי מופנה ל־`/` בכל עמוד Non-Open.

---

### 2.3 User Icon — Success/Warning, לא שחור ✅

**מצב:**
- **מחובר:** `user-profile-link--success` + `user-icon--success` (ירוק)
- **מנותק:** `user-profile-link--alert` + `user-icon--alert` (כתום/התראה)
- **ברירת מחדל:** צבע Warning — למניעת מצב שבו האייקון שחור

**שינוי:** הוספת `color: var(--color-warning, ...)` ל־`.user-icon` כרוחב ברירת מחדל ב־phoenix-header.css.

**קוד:** `ui/src/styles/phoenix-header.css` (שורות 978–993), `ui/src/components/core/headerLinksUpdater.js` (שורות 80–109)

**קריטריון הצלחה:** אין מצב שבו האייקון שחור.

---

### 2.4 ברוקר "אחר" (ADR-018) ✅

**מצב:**
- בחירת "אחר" פותחת שדה טקסט חופשי (`brokerOtherName`)
- הודעה: "רוצה שנוסיף תמיכה בברוקר שלך? צור קשר" — עם קישור ל־mailto
- שליחה ל־API עם `is_supported: false` כשנבחר "אחר"

**שינויים:**
- `adr015GovernanceMessage.js` — עדכון טקסט ההודעה ל־ADR-018; `linkText`: "צור קשר"
- `tradingAccountsForm.js` — הוספת `isSupported: false` ל־formData כש־broker === 'other'

**קוד:**  
`ui/src/views/financial/shared/adr015GovernanceMessage.js`  
`ui/src/views/financial/tradingAccounts/tradingAccountsForm.js` (שורות 58–62, 167–170, 294–304)

**קריטריון הצלחה:** UI תואם; סימון is_supported=false.

---

## 3. Evidence

| פריט | קובץ |
|------|------|
| גרסה | `ui/package.json` |
| Redirect | `ui/src/components/core/authGuard.js` |
| User Icon | `ui/src/styles/phoenix-header.css`, `ui/src/components/core/headerLinksUpdater.js` |
| Broker Other | `ui/src/views/financial/shared/adr015GovernanceMessage.js`, `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js` |

---

## 4. אימות

- `npm run build` — PASS

---

**Team 30 (Frontend Execution)**  
**log_entry | TEAM_30 | BATCH_2_5_COMPLETION | TEAM_10 | 2026-02-12**
