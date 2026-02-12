# Team 10 → Team 30: מנדט ADR-015 — D16 ברוקר "אחר" + D18 עמלות לפי חשבון

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**עדכון:** 2026-02-12 — **עמלות לפי חשבון מסחר; "אחר" רק ב-D16.**  
**מקור:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015); החלטת אדריכלית.

**סטטוס:** READY FOR DISTRIBUTION — ראה ADR_015_READY_FOR_DISTRIBUTION.md.

**יישור תפקידים (SLA 30/40):** צוות 30 = Containers (לוגיקה, API). צוות 40 = Presentational (CSS, עיצוב). אם נדרש רכיב Presentational חדש להודעת המשילות — צוות 40 מספק; צוות 30 משלב.

---

## 1. עקרון מחייב

**עמלות שייכות לחשבון מסחר (Trading Account), לא לברוקר.**  
D18 = **עמלות לכל חשבון מסחר** — בחירת חשבון + עמלות של החשבון.  
**"אחר" (Other broker)** שייך **לבחירת ברוקר ב-D16 בלבד** — לא לעמלות.

---

## 2. דרישות לפי עמוד

### 2.1 D16 — חשבונות מסחר

| דרישה | פירוט |
|--------|--------|
| **בחירת ברוקר** | רשימת ברוקרים מ-GET /api/v1/reference/brokers (לבניית חשבון מסחר בלבד). |
| **"אחר"** | פריט 'other' — הכנסת שם ידני. **בבחירת "אחר"** — **הצגת הודעת המשילות** (§2.1א). **רק ב-D16.** |
| **אין עמלות ב-D16** | שדות עמלות לא שייכים לטופס חשבון מסחר (בהמשך ייתכן מודול ניהול עמלות בתוך D16 — הנחיה עתידית). |

#### 2.1א טקסט הודעת המשילות (D16 בלבד) — SSOT סגור

טקסט מלא + קישור: **מסמך SSOT** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`. ערך `primary_admin_contact` = `mailto:support@tiktrack.app` (או מ-env `PRIMARY_ADMIN_EMAIL`). אין placeholder בממשק.

### 2.2 D18 — עמלות לכל חשבון מסחר

| דרישה | פירוט |
|--------|--------|
| **בחירת חשבון** | D18 UI: **בחירת חשבון מסחר** + **עמלות של החשבון** (סינון/תצוגה לפי חשבון). |
| **trading_account_id** | בכל פעולה של עמלה (הוספה/עריכה/תצוגה) — **trading_account_id** של החשבון הנבחר. |
| **אין "בעלות" ברוקר על עמלות** | אין מקום ב-D18 שבו "broker = owner of fees". ברוקר נגזר מחשבון. |
| **הצעת מילוי (אופציונלי)** | בעת הוספת עמלה לחשבון — אופציונלי: הצעת מילוי שדות מ-**default_fees** לפי **ברוקר של החשבון** (מתגובת reference/brokers). |

---

## 3. תוצר מצופה

- **D16:** Conditional Rendering "אחר" + הודעת משילות (טקסט §2.1א) — **בבחירת ברוקר בלבד**.
- **D18:** UI — בחירת חשבון מסחר + רשימה/טפסים של עמלות **של אותו חשבון** (כל פעולה עם trading_account_id). אופציונלי: הצעת מילוי מ-default_fees לפי ברוקר החשבון.
- דוח השלמה ל-Team 10 עם רפרנס ל-ADR-015.

---

## 4. Acceptance Criteria (רלוונטי ל-Frontend)

- D18 מציג עמלות **לפי חשבון מסחר בלבד** (בחירת חשבון + עמלות של החשבון).
- בכל פעולה של עמלה יש **trading_account_id** (נשלח ל-API).
- "Other broker" והודעת המשילות — **ב-D16 בלבד**.
- אין מקום ב-UI שבו "broker = owner of fees".

---

## 5. רפרנסים

- **תוכנית עבודה:** [TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md](./TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md)
- **מסמך סופי לאישור:** [ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md](./ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md)
- **טפסים:** D16 — `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`; D18 — `ui/src/views/financial/brokersFees/` (להגדרה מחדש: עמלות לפי חשבון).

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | MANDATE_TO_TEAM_30_UPDATED_FEES_PER_ACCOUNT | 2026-02-12**
