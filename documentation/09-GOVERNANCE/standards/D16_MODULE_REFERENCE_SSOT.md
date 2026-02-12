# 🔒 מודול דוגמה — D16 חשבונות מסחר (SSOT נעול)

**id:** `D16_MODULE_REFERENCE_SSOT`  
**owner:** Team 30 (Frontend) + G-Lead  
**status:** ✅ **SSOT - LOCKED** (מודול דוגמה רשמי)  
**תאריך נעילה:** 2026-01-31  
**מבוסס על:** [ARCHITECT_MODULE_MENU_STYLING_SSOT.md](../ARCHITECT_MODULE_MENU_STYLING_SSOT.md)

---

## 1. הכרזה

**מודול D16 (חשבונות מסחר)** הוא **מודול הדוגמה הרשמי** לכל המודולים במערכת. כל מודול חדש או מתוחזק חייב להתאים לסטנדרטים המתועדים להלן.  
**יישום לכל המודולים (D18, D21 וכו'):** הודעות rollout נשלחו ל-Team 30 ו-Team 40 — ראה `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_D16_REFERENCE_ROLLOUT.md` ו-`TEAM_10_TO_TEAM_40_D16_REFERENCE_ROLLOUT.md`.

---

## 2. תיעוד דיוקי עיצוב (Fidelity Refinements) שבוצעו

### 2.1 שדות טופס — Input ו-Select

| נושא | סטנדרט | יישום |
|------|--------|-------|
| **גובה אחיד** | input, textarea, select — padding זהה | `padding: 8px 16px` (קבוע, override ל-phoenix-base) |
| **Override ל-base** | ללא `!important` | שימוש ב-specificity: `input:not([type=...])×6` + `.phoenix-modal__body` |
| **צבע focus** | צבע ראשי אחיד | `border-color: var(--color-brand, #26baac)` |

### 2.2 כפתורי Footer (שמירה / ביטול)

| נושא | סטנדרט | יישום |
|------|--------|-------|
| **סגנון ברירת מחדל** | רקע לבן, מסגרת וטקסט בצבע | Save: `background: white`, `color: var(--color-brand)`, `border-color: var(--color-brand)` |
| **Hover על שמירה** | היפוך: רקע צבע, טקסט לבן | `background: var(--color-brand)`, `color: white` |
| **Padding כפתורים** | 8px למעלה ולמטה | `padding: 8px var(--spacing-lg, 24px)` |

### 2.3 טקסט כפתור שמירה

| נושא | סטנדרט |
|------|--------|
| טקסט | **שמירה** (לא "שמור") |

### 2.4 פריסת טופס — שורות דו-עמודתיות

| שורה | שדות |
|------|------|
| 1 | ברוקר \| מספר חשבון |
| 2 | מטבע \| יתרה התחלתית |
| 3 | סטטוס \| מזהה חשבון חיצוני |

- **רווח בין עמודות:** 21px (`gap: 21px` ב-`.form-row`)
- **מחלקה:** `.form-row` עם `display: flex`, `.form-group { flex: 1 }`

### 2.5 כוכבית ולידציה

| אלמנט | צבע |
|-------|------|
| **כוכבית (*)** | `var(--color-error-red, #dc2626)` — `.form-label-asterisk` |
| **הודעות ולידציה** | `var(--color-error-red, #dc2626)` — `.form-error` |

### 2.6 RTL וכפתורים

- **סדר DOM:** Cancel לפני Save → Cancel מימין, Save משמאל (RTL)
- **צבעי כותרת מודול:** Light BG + Dark text/close/border (לפי ARCHITECT_MODULE_MENU_STYLING_SSOT)

---

## 3. קבצי ייחוס (Reference Files)

| קובץ | תיאור |
|------|--------|
| `ui/src/styles/phoenix-modal.css` | סגנונות מודול, form-row, כפתורים, שדות |
| `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js` | מבנה טופס, ולידציה, פריסה דו-עמודתית |
| `ui/src/components/shared/PhoenixModal.js` | רכיב מודול — ברירת מחדל "שמירה" |

---

## 4. הוראות ליישום במודולים נוספים

1. **פריסת טופס:** שימוש ב-`.form-row` עם שני `.form-group` לכל שורה.
2. **שדות:** הוספת `.form-label-asterisk` לכוכבית שדות חובה.
3. **כפתורים:** `phoenix-modal__save-btn`, `phoenix-modal__cancel-btn` — לפי הסטנדרט.
4. **Override ל-base:** שמירת specificity מספקת (או טעינת phoenix-modal.css אחרי phoenix-base).

---

## 5. רשימת ברוקרים

- **מקור:** `api/data/defaults_brokers.json` + ברוקרים ייחודיים מ-`trading_accounts.broker`
- **נוכחי:** IBKR, IBI, Test_Broker, אחר
- **Deduplication:** "אחר" מופיע פעם אחת (ב-frontend וב-reference_service)

---

## 6. וולידציה (D16)

- **חובה:** שם חשבון, ברוקר, מספר חשבון, יתרה התחלתית
- **ייחודיות:** שם חשבון ומספר חשבון ייחודיים למשתמש (client-side + תיאום Team 20)

---

**log_entry | [Team 30] | D16_MODULE_REFERENCE | LOCKED | 2026-01-31 | G-Lead approval**
