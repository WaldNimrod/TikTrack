# מיפוי מקומות בקוד — סטטוסים מערכתיים (לפי SSOT)

**id:** `TT2_STATUS_VALUES_CODE_MAP`  
**owner:** Team 10 (The Gateway)  
**SSOT:** `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`  
**last_updated:** 2026-02-12

---

## 1. תיעוד (תואם / עודכן)

| מקום | סטטוס | הערה |
|------|--------|------|
| `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md` | ✅ SSOT | רשימת ארבעת הסטטוסים + עברית |
| `documentation/01-ARCHITECTURE/TT2_EFR_LOGIC_MAP.md` | ✅ עודכן | הפניה ל-SSOT + תרגום עברית בסעיף Status Fields |

---

## 2. מקומות בקוד הדורשים תיקון או עדכון

### 2.1 Header — תפריט סינון סטטוס

| קובץ | פעולה נדרשת | פרט |
|------|-------------|------|
| `ui/src/views/shared/unified-header.html` | **להוסיף אופציה "ממתין"** | בתפריט `#statusFilterMenu` קיימות: הכול, פתוח, סגור, מבוטל. **חסר:** ממתין (`data-value="ממתין"`). להוסיף אחרי "סגור" ולפני "מבוטל" (או לפי סדר SSOT: פתוח, סגור, ממתין, מבוטל). |

### 2.2 לוגיקת סינון (Frontend)

| קובץ | פעולה נדרשת | פרט |
|------|-------------|------|
| `ui/src/views/financial/tradingAccounts/tradingAccountsFiltersIntegration.js` | **להרחיב ל-4 סטטוסים** | כיום: `statusFilter.textContent === 'פתוח'` → משלב רק פתוח. יש למפות עברית → קנוני (פתוח→active, סגור→inactive, ממתין→pending, מבוטל→cancelled) ולשלוח ל-API/לוגיקת סינון. |
| `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` | **להרחיב ל-4 סטטוסים** | שורות 444–451: `globalFilters.status = statusFilter.textContent === 'פתוח'` — להחליף במיפוי עברית→קנוני ולשלוח ערך קנוני (או בוליאני רק אם API תומך רק ב-active/לא). |
| `ui/src/components/core/phoenixFilterBridge.js` | **וידוא** | שורות 256, 405 — שימוש ב-`#selectedStatus`. לוודא שאחרי עדכון unified-header ו-DataLoader, הערך הנשלח תואם ל-SSOT (קנוני). |

### 2.3 תצוגת שורות (בדגלים / badges)

| קובץ | פעולה נדרשת | פרט |
|------|-------------|------|
| `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` | **וידוא עקביות** | שורות 555–556: פעיל/לא פעיל (isActive) — ייתכן שזה שדה נפרד מ-`status`. שורות 800–801: פתוח/סגור לפי status. שורות 721–724: מאומת/ממתין — אם זה status, למפות ל-קנוני (מאומת→active?, ממתין→pending). **להתאים** לתבנית ארבעת הסטטוסים אם השדה הוא status. |

### 2.4 עמודים/תבניות נוספות (סינון סטטוס)

| מקום | פעולה נדרשת | פרט |
|------|-------------|------|
| `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D21_CASH_VIEW.html` | **להוסיף "ממתין"** | בתפריט סינון סטטוס: קיימים פתוח, סגור, מבוטל. להוסיף ממתין. |
| `_COMMUNICATION/team_01/team_01_staging/D16_ACCTS_VIEW_BLUEPRINT.html` | **להוסיף "ממתין"** | כמו למעלה. |
| דפים/קומפוננטות נוספים עם `status-filter-item` או `data-value="פתוח"` וכו' | **סריקה** | לחפש בכל הפרויקט `data-value="פתוח"` / `status-filter` ולוודא שכל מקום מציג ארבע אופציות + משתמש ב-SSOT. |

---

## 3. סיכום פעולות

| עדיפות | פעולה | בעלים מוצע |
|--------|--------|-------------|
| P1 | הוספת "ממתין" ל-`unified-header.html` | Team 30 / Team 31 |
| P1 | הרחבת לוגיקת סינון ב-tradingAccounts ל-4 סטטוסים (מיפוי עברית↔קנוני) | Team 30 |
| P2 | וידוא phoenixFilterBridge ו-DataLoader משתמשים בערך קנוני ב-API | Team 30 |
| P2 | התאמת תצוגת badges (פעיל/לא פעיל, פתוח/סגור, מאומת/ממתין) ל-SSOT אם השדה הוא status | Team 30 |
| P3 | עדכון blueprints/d21/d16 staging — הוספת "ממתין" בתפריטי סינון | Team 31/40 לפי בעלות |

---

**log_entry | TEAM_10 | STATUS_VALUES_CODE_MAP | 2026-02-12**
