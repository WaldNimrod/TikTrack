# Team 10 → Team 30: יישום סטנדרט מודול הדוגמה (D16) — לכל המודולים

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**הקשר:** G-Lead אישר עיצוב ועימוד מודול D16 (הוספת חשבון מסחר); מודול הדוגמה ננעל. יש ליישם את הסטנדרט בכל המודולים במערכת.

---

## 1. סטטוס מודול הדוגמה

- **D16 (חשבונות מסחר)** — אושר כרפרנס ע״י G-Lead; תיעוד ננעל ב-`documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md`.
- **חובה:** כל מודול במערכת (טפסים, מודלים, כותרות) חייב להתאים לסטנדרטים המתועדים שם.

---

## 2. מודולים ליישום

| מודול | תיאור | קבצי טופס/מודל רלוונטיים |
|--------|--------|---------------------------|
| **D18** | עמלות ברוקרים | `ui/src/views/financial/brokersFees/brokersFeesForm.js`, מודל הוספה/עריכה |
| **D21** | תזרימי מזומן | `ui/src/views/financial/cashFlows/cashFlowsForm.js`, מודל הוספה/עריכה |
| **כל מודול נוסף** | מודלים/טפסים עם כפתורי שמירה/ביטול, שדות, כותרת | לפי אותו סטנדרט |

---

## 3. SSOT ו־Reference Files

| מסמך/קובץ | שימוש |
|-----------|--------|
| **D16_MODULE_REFERENCE_SSOT.md** | סטנדרט מחייב: שדות (גובה, focus), כפתורי Footer (שמירה/ביטול), פריסת טופס (form-row), כוכבית/ולידציה, RTL, צבעי כותרת. |
| **ARCHITECT_MODULE_MENU_STYLING_SSOT.md** | RTL (Cancel לפני Save), צבעי כותרת מודול (Light BG + Dark text/close/border). |
| **phoenix-modal.css** | סגנונות משותפים — form-row, כפתורים, שדות. |
| **tradingAccountsForm.js** | מבנה טופס, פריסה דו-עמודתית, ולידציה — כרפרנס. |
| **PhoenixModal.js** | רכיב מודול — טקסט "שמירה" (לא "שמור"). |

---

## 4. משימות (Checklist ליישום ב-D18, D21)

- [ ] **פריסת טופס:** `.form-row` + שני `.form-group` לשורה; `gap: 21px`.
- [ ] **שדות:** גובה אחיד (`padding: 8px 16px`), focus `var(--color-brand)`; `.form-label-asterisk` לשדות חובה.
- [ ] **כפתורים:** `phoenix-modal__save-btn`, `phoenix-modal__cancel-btn`; טקסט "שמירה"; Cancel מימין, Save משמאל (RTL).
- [ ] **כותרת מודול:** Light BG + Dark text/close/border (לפי ישות).
- [ ] **ולידציה:** צבע כוכבית והודעות `var(--color-error-red)`.
- [ ] **Override ל-base:** ללא `!important`; specificity או סדר טעינת CSS (phoenix-modal.css אחרי phoenix-base).

---

## 5. דיווח

לאחר יישום — עדכון ל-Team 10 (או דוח קצר) עם רשימת המודולים שעודכנו ואישור עמידה ב-D16 reference. דיוק ויזואלי סופי — **מול G-Lead** לפי הנחיית השער.

---

**log_entry | TEAM_10 | D16_REFERENCE_ROLLOUT_TO_TEAM_30 | 2026-02-12**
