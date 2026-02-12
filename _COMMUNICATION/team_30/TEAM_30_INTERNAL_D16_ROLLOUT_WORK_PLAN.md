# תוכנית עבודה פנימית — Team 30: יישום D16 Rollout (D18, D21)

**מאת:** Team 30 (Frontend)  
**תאריך:** 2026-01-31  
**מבוסס על:** TEAM_10_TO_TEAM_30_D16_REFERENCE_ROLLOUT.md, D16_MODULE_REFERENCE_SSOT.md

---

## 1. מטרה

יישום סטנדרט מודול הדוגמה (D16) במודולים D18 (עמלות ברוקרים) ו-D21 (תזרימי מזומן), בצורה מסודרת ויסודית, כולל סריקה ובדיקה לפני הגשה.

---

## 2. Checklist D16 (Reference)

| # | קריטריון | D16 | D18 | D21 |
|---|----------|-----|-----|-----|
| 1 | פריסת טופס: `.form-row` + 2 `.form-group`, `gap: 21px` | ✓ | ✓ | ✓ |
| 2 | שדות: `padding: 8px 16px`, focus `var(--color-brand)` | ✓ (modal) | ✓ | ✓ |
| 3 | `.form-label-asterisk` לשדות חובה | ✓ | ✓ | ✓ |
| 4 | כפתורים: `phoenix-modal__save-btn`, `cancel`; טקסט "שמירה" | ✓ | ✓ | ✓ |
| 5 | RTL: Cancel מימין, Save משמאל | ✓ (PhoenixModal) | ✓ | ✓ |
| 6 | כותרת מודול: Light BG + Dark (לפי ישות) | ✓ (phoenix-modal) | ✓ | ✓ |
| 7 | ולידציה: צבע `--color-error-red` | ✓ | ✓ | ✓ |
| 8 | onSave: async-aware, סגירת מודול רק בהצלחה | ✓ | ✓ | ✓ |

---

## 3. משימות מפורטות

### שלב א': D18 (Brokers Fees)

| # | משימה | פרטים | סטטוס |
|---|-------|--------|-------|
| D18-1 | פריסה דו-עמודתית | שורה 1: (tradingAccountId \| commissionType); שורה 2: (commissionValue \| minimum) | ✅ |
| D18-2 | onSave async | await onSave; close רק בהצלחה; try-catch כמו D16 | ✅ |
| D18-3 | וידוא ולידציה | הודעות ב-form-error; ניקוי שגיאות לפני שליחת טופס | ✅ |

### שלב ב': D21 (Cash Flows)

| # | משימה | פרטים | סטטוס |
|---|-------|--------|-------|
| D21-1 | פריסה | כבר דו-עמודתית; וידוא form-row / form-group | ✅ |
| D21-2 | onSave async | await onSave; close רק בהצלחה; try-catch | ✅ |
| D21-3 | וידוא ולידציה | הודעות עקביות; ניקוי שגיאות | ✅ |

### שלב ג': סריקה ובדיקה

| # | משימה | פרטים |
|---|-------|--------|
| V-1 | השוואה ל-D16 | מבנה HTML, classes, סדר כפתורים |
| V-2 | בדיקת טעינת CSS | phoenix-modal.css נטען; אין !important מיותר |
| V-3 | בדיקה מנואלית | פתיחת מודולים, מילוי, ולידציה, שמירה |

---

## 4. קבצים לגעת

| קובץ | שינויים |
|------|---------|
| `ui/src/views/financial/brokersFees/brokersFeesForm.js` | פריסה, onSave async |
| `ui/src/views/financial/cashFlows/cashFlowsForm.js` | onSave async |
| `ui/src/styles/phoenix-modal.css` | אין שינוי נדרש (כבר תואם) |

---

## 5. סדר ביצוע

1. **D18** — brokersFeesForm.js (פריסה + async) ✅
2. **D21** — cashFlowsForm.js (async) ✅
3. **סריקה** — השוואה ל-D16, וידוא checklist ✅
4. **דוח** — עדכון Team 10

---

## 6. סיכום ביצוע (Post-Verification)

| קובץ | שינויים |
|------|---------|
| brokersFeesForm.js | פריסה 2 שורות (tradingAccountId\|commissionType, commissionValue\|minimum); onSave async; clear errors לפני ולידציה |
| brokersFeesTableInit.js | return handleSaveBrokerFee; throw error ב-catch |
| cashFlowsForm.js | onSave async; clear errors; option "– בחר חשבון מסחר –" |
| cashFlowsTableInit.js | return handleSaveCashFlow; throw error ב-catch |

---

**log_entry | [Team 30] | D16_ROLLOUT_WORK_PLAN | COMPLETED | 2026-01-31**
