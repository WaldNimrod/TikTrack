# מיפוי מקומות בקוד — סטטוסים מערכתיים (לפי SSOT)

**id:** `TT2_STATUS_VALUES_CODE_MAP`  
**owner:** Team 10 (The Gateway)  
**SSOT:** `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`  
**last_updated:** 2026-02-12  
**מנדט יישום:** `_COMMUNICATION/team_10/TEAM_10_SYSTEM_STATUS_IMPLEMENTATION_MANDATE.md`  
**בדיקת מוכנות + שאלות להשלמה:** `_COMMUNICATION/team_10/TEAM_10_STATUS_IMPLEMENTATION_READINESS_AND_QUESTIONS.md`

---

## 1. מקור קוד יחיד + Adapter (הוטמעו)

| מקום | תפקיד | הערה |
|------|--------|------|
| `ui/src/utils/statusValues.js` | מקור יחיד | `STATUS_VALUES`, `STATUS_CANONICAL`, `STATUS_LABELS_HE` |
| `ui/src/utils/statusAdapter.js` | Adapter יחיד | `toCanonicalStatus`, `toHebrewStatus`, `getStatusOptions` — **כל השימושים רק דרכו** |

---

## 2. תיעוד (תואם / עודכן)

| מקום | סטטוס | הערה |
|------|--------|------|
| `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md` | ✅ SSOT | עקרון Single Source + נתיבי קוד + Acceptance Criteria + אסור |
| `documentation/01-ARCHITECTURE/TT2_EFR_LOGIC_MAP.md` | ✅ עודכן | הפניה ל-SSOT + תרגום עברית בסעיף Status Fields |

---

## 3. מקומות בקוד — מעבר ל-Adapter (חובה)

**כל המקומות להלן חייבים להשתמש ב-`statusAdapter.js` בלבד (אין ערכים קשיחים במודול).**

### 3.1 Header — תפריט סינון סטטוס

| קובץ | פעולה נדרשת | פרט |
|------|-------------|------|
| `ui/src/views/shared/unified-header.html` | **4 אופציות + מסונן מ-Adapter** | (א) להוסיף "ממתין" אם חסר. (ב) אופציות התפריט — מומלץ ליצור דינמית מ-`getStatusOptions()` (או לשמור סדר: פתוח, סגור, ממתין, מבוטל). |
| JS שמזין/קורא את התפריט | **שימוש ב-Adapter** | קריאת ערך נבחר → `toCanonicalStatus(label)`; הצגת אופציות ← `getStatusOptions()`. |

### 3.2 לוגיקת סינון (Frontend)

| קובץ | פעולה נדרשת | פרט |
|------|-------------|------|
| `ui/src/views/financial/tradingAccounts/tradingAccountsFiltersIntegration.js` | **Adapter בלבד** | להחליף `statusFilter.textContent === 'פתוח'` ב-`toCanonicalStatus(statusFilter.textContent)`; לשלוח ערך קנוני ל-API. |
| `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` | **Adapter בלבד** | שורות 444–451: `globalFilters.status = toCanonicalStatus(statusFilter.textContent)` (או ערך קנוני). |
| `ui/src/components/core/phoenixFilterBridge.js` | **תאום ל-Adapter** | וידוא שהערך הנשלח/מתקבל תואם קנוני דרך `toCanonicalStatus` / `toHebrewStatus`. |

### 3.3 תצוגת שורות (בדגלים / badges)

| קובץ | פעולה נדרשת | פרט |
|------|-------------|------|
| `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` | **וידוא עקביות** | שורות 555–556: פעיל/לא פעיל (isActive) — ייתכן שזה שדה נפרד מ-`status`. שורות 800–801: פתוח/סגור לפי status. שורות 721–724: מאומת/ממתין — אם זה status, למפות ל-קנוני (מאומת→active?, ממתין→pending). **להתאים** לתבנית ארבעת הסטטוסים אם השדה הוא status. |

### 3.4 עמודים/תבניות נוספות (סינון סטטוס)

| מקום | פעולה נדרשת | פרט |
|------|-------------|------|
| `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D21_CASH_VIEW.html` | **להוסיף "ממתין"** | בתפריט סינון סטטוס: קיימים פתוח, סגור, מבוטל. להוסיף ממתין. |
| `_COMMUNICATION/team_01/team_01_staging/D16_ACCTS_VIEW_BLUEPRINT.html` | **להוסיף "ממתין"** | כמו למעלה. |
| דפים/קומפוננטות נוספים עם `status-filter-item` או `data-value="פתוח"` וכו' | **סריקה** | לחפש בכל הפרויקט `data-value="פתוח"` / `status-filter` ולוודא שכל מקום מציג ארבע אופציות + משתמש ב-SSOT. |

---

## 4. סיכום פעולות

| עדיפות | פעולה | בעלים מוצע |
|--------|--------|-------------|
| P1 | Header: 4 אופציות (כולל ממתין) + שימוש ב-`getStatusOptions()` / Adapter | Team 30 |
| P1 | DataLoaders + Filters: החלפת לוגיקה קשיחה ב-`toCanonicalStatus` / `toHebrewStatus` | Team 30 |
| P2 | PhoenixFilterBridge: תיאום ל-SSOT דרך Adapter | Team 30 |
| P2 | badges: תצוגת עברית רק דרך `toHebrewStatus(value)` | Team 30 |
| P3 | blueprints/staging: אופציות סינון תואמות + Adapter אם יש JS | Team 31/40 |

---

**log_entry | TEAM_10 | STATUS_VALUES_CODE_MAP | 2026-02-12**
