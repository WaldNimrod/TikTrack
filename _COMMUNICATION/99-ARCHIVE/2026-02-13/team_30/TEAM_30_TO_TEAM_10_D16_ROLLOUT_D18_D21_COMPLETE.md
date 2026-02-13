# Team 30 → Team 10: דוח השלמה — D16 Rollout (D18, D21)

**מאת:** Team 30 (Frontend)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-01-31  
**נושא:** יישום סטנדרט D16 במודולים D18 ו-D21 — הושלם

**מבוסס על:** `TEAM_10_TO_TEAM_30_D16_REFERENCE_ROLLOUT.md`

---

## 1. סיכום ביצוע

| מודול | סטטוס | קבצים שעודכנו |
|-------|-------|----------------|
| **D18** (עמלות ברוקרים) | ✅ הושלם | brokersFeesForm.js, brokersFeesTableInit.js |
| **D21** (תזרימי מזומן) | ✅ הושלם | cashFlowsForm.js, cashFlowsTableInit.js |

---

## 2. שינויים מפורטים

### 2.1 D18 — Brokers Fees

| # | שינוי | פרטים |
|---|-------|--------|
| 1 | **פריסה דו-עמודתית** | שורה 1: (חשבון מסחר \| סוג עמלה); שורה 2: (ערך עמלה \| מינימום) — `.form-row` + 2 `.form-group` |
| 2 | **onSave async** | await על onSave; try-catch; סגירת מודול רק בהצלחה |
| 3 | **ניקוי שגיאות** | clear errors לפני ולידציה |
| 4 | **TableInit** | `return handleSaveBrokerFee(...)`; `throw error` ב-catch — מודל נשאר פתוח בשגיאת API |

### 2.2 D21 — Cash Flows

| # | שינוי | פרטים |
|---|-------|--------|
| 1 | **onSave async** | await על onSave; try-catch; סגירת מודול רק בהצלחה |
| 2 | **ניקוי שגיאות** | clear errors לפני ולידציה |
| 3 | **אחידות placeholder** | `-- בחר חשבון מסחר --` (כמו D16/D18) |
| 4 | **TableInit** | `return handleSaveCashFlow(...)`; `throw error` ב-catch |

---

## 3. עמידה ב-Checklist D16

| # | קריטריון | D18 | D21 |
|---|----------|-----|-----|
| 1 | פריסת טופס: form-row + 2 form-group, gap 21px | ✓ | ✓ |
| 2 | שדות: padding 8px 16px, focus brand (phoenix-modal.css) | ✓ | ✓ |
| 3 | form-label-asterisk לשדות חובה | ✓ | ✓ |
| 4 | כפתורים: saveButtonText "שמירה" | ✓ | ✓ |
| 5 | RTL: Cancel מימין, Save משמאל (PhoenixModal) | ✓ | ✓ |
| 6 | כותרת מודול: Light BG + Dark (לפי ישות) | ✓ | ✓ |
| 7 | ולידציה: צבע --color-error-red | ✓ | ✓ |
| 8 | onSave: async-aware, סגירת מודול רק בהצלחה | ✓ | ✓ |

---

## 4. קבצים שעודכנו

| קובץ | שינויים |
|------|---------|
| `ui/src/views/financial/brokersFees/brokersFeesForm.js` | פריסה 2 שורות; onSave async; clear errors |
| `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` | return handleSaveBrokerFee; throw error |
| `ui/src/views/financial/cashFlows/cashFlowsForm.js` | onSave async; clear errors; option "– בחר חשבון מסחר –" |
| `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` | return handleSaveCashFlow; throw error |

---

## 5. בדיקה מנואלית מומלצת

- [ ] פתיחת מודול הוספת עמלה (D18) — בדיקת פריסה וולידציה
- [ ] פתיחת מודול הוספת תזרים (D21) — בדיקת שמירה ושגיאות
- [ ] דיוק ויזואלי סופי — **מול G-Lead** (לפי הנחיית השער)

---

**סטטוס:** ✅ יישום הושלם | ממתין לבדיקה מנואלית ואישור G-Lead

**log_entry | [Team 30] | D16_ROLLOUT_D18_D21 | DELIVERED | 2026-01-31**
