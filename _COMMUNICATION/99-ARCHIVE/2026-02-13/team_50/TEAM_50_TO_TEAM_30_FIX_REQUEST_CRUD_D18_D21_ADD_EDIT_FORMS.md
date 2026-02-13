# דרישת תיקון — Team 50 → Team 30: מודל/טופס להוספה ולעריכה (D18, D21)

**אל:** Team 30 (Frontend Execution)  
**מאת:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-01-31  
**חומרה:** **High** (פעולות הוספה ועריכה לא שמישות למשתמש בלי טופס)

---

## 1. השגיאה / ההתנהגות המדויקת

**התנהגות נוכחית (ראיות ריצה — E2E Selenium):**

- **D18 — "הוסף ברוקר":** לחיצה על הכפתור גורמת ל-POST מיידי ל-`/api/v1/brokers_fees` עם גוף: `broker: ""`, `commission_value: ""` (ויתר ברירת מחדל). ה-API מחזיר שגיאת ולידציה (422). בממשק מוצג **alert:** `"שגיאה בשמירת העמלה"`.
- **D21 — "הוסף תזרים":** לחיצה על הכפתור גורמת ל-POST מיידי ל-`/api/v1/cash_flows` עם נתוני ברירת מחדל (כולל `tradingAccountId` ריק/לא תקף, `amount: 0`). ה-API מחזיר שגיאת ולידציה. בממשק מוצג **alert:** `"שגיאה בשמירת התזרים"`.
- **עריכה (D18, D21):** לחיצה על "ערוך" בשורה קוראת ל-`showBrokerFeeModal(data, 'edit')` / `showCashFlowModal(data, 'edit')` שמפעילות ישירות `handleSaveBrokerFee(id, data)` / `handleSaveCashFlow(id, data)` — כלומר PUT עם אותם נתונים, **בלי להציג טופס** למשתמש. אין אפשרות לשנות ערכים.

**מקור ראיות:**  
`documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json` — שדות `addBrokerAlert`, `addFlowAlert`.

---

## 2. שחזור (Reproduction)

**D18 — הוספה:**

1. התחברות: `http://localhost:8080/login` — TikTrackAdmin / 4181.
2. ניווט: `http://localhost:8080/brokers_fees.html`.
3. המתנה לטעינת הטבלה (כ־4 שניות).
4. לחיצה על כפתור "הוסף ברוקר" (`.js-add-broker-fee`).
5. **תוצאה:** מופיע alert "שגיאה בשמירת העמלה" (ללא מודל/טופס להזנת נתונים).

**D21 — הוספה:**

1. התחברות above.
2. ניווט: `http://localhost:8080/cash_flows.html`.
3. לחיצה על "הוסף תזרים" (`.js-add-cash-flow`).
4. **תוצאה:** מופיע alert "שגיאה בשמירת התזרים".

**עריכה (D18):**

1. בעמוד ברוקרים ועמלות — לחיצה על כפתור "ערוך" בשורה כלשהי.
2. **תוצאה:** מתבצע PUT עם נתוני השורה ללא הצגת טופס; אין UI לעדכון שדות.

(אותו דפוס ב-D21 לעריכת תזרים.)

---

## 3. מיקום בקוד

| עמוד | קובץ | שורות | תיאור |
|------|------|--------|--------|
| D18 | `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` | 430–449 | `showBrokerFeeModal(data, mode)` — ב-`mode === 'add'` יוצר אובייקט ברירת מחדל וקורא ל-`handleSaveBrokerFee(null, newBrokerFeeData)` ללא UI. ב-`mode === 'edit'` קורא ל-`handleSaveBrokerFee(data.id, data)` ללא טופס. |
| D18 | אותו קובץ | 422–425 | `handleAddBrokerFee()` קורא ל-`showBrokerFeeModal(null, 'add')`. |
| D21 | `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` | 817–841 | `showCashFlowModal(data, mode)` — `add` ו-`edit` באותו דפוס: שליחה ל-`handleSaveCashFlow` בלי טופס. |
| D21 | אותו קובץ | 811–815 | `handleAddCashFlow()` קורא ל-`showCashFlowModal(null, 'add')`. |

**הערה:** בקוד קיים TODO: "Implement modal UI (can use existing modal component or create new one)".

---

## 4. סיבת הכשל (במשפט אחד)

אין מימוש ל-UI של מודל/טופס להוספה ולעריכה — ה-handlers קוראים ישירות ל-POST/PUT עם נתוני ברירת מחדל או נתוני השורה, בלי להציג למשתמש שדות להזנה/עדכון.

---

## 5. תיקון נדרש (מה לעשות)

### 5.1 D18 (Brokers Fees)

- **הוספה:** כאשר `showBrokerFeeModal(null, 'add')` — להציג **מודל (או דף) טופס** עם שדות: שם ברוקר (`broker`), סוג עמלה (`commission_type`: TIERED/FLAT), ערך עמלה (`commission_value`), מינימום (`minimum`). כפתור "שמור" יאסוף את הערכים (בממשק camelCase), יקרא ל-`handleSaveBrokerFee(null, payload)` ויסגור את המודל. לא לבצע POST ישירות עם ערכים ריקים.
- **עריכה:** כאשר `showBrokerFeeModal(data, 'edit')` — להציג **מודל טופס עריכה** עם השדות above ממולאים מ-`data`. כפתור "שמור" יקרא ל-`handleSaveBrokerFee(data.externalUlid || data.id, payload)` עם הנתונים המעודכנים מהטופס.

### 5.2 D21 (Cash Flows)

- **הוספה:** כאשר `showCashFlowModal(null, 'add')` — להציג **מודל טופס** עם שדות לפי סכמת ה-API (למשל: `trading_account_id`, `transaction_date`, `flow_type`, `amount`, `currency`, `description` וכו'). כפתור "שמור" יקרא ל-`handleSaveCashFlow(null, payload)`.
- **עריכה:** כאשר `showCashFlowModal(data, 'edit')` — להציג **מודל טופס עריכה** עם השדות ממולאים מ-`data`. "שמור" → `handleSaveCashFlow(data.externalUlid || data.id, payload)`.

### 5.3 פרטים טכניים

- שמירה על שימוש ב-`Shared_Services` (POST/PUT) ובהמרת camelCase ↔ snake_case.
- אי-שינוי לוגיקת `handleSaveBrokerFee` / `handleSaveCashFlow` מלבד קבלת payload מהטופס במקום מאובייקט ברירת מחדל/שורה.
- אופציונלי: שיפור צפייה (View) alert(JSON) למודל/תצוגה קריאה — לא חובה בדרישה זו.

---

## 6. אימות אחרי תיקון

1. **D18 — הוספה:** התחברות → `brokers_fees.html` → "הוסף ברוקר" → מילוי הטופס (שם ברוקר, ערך עמלה, מינימום) → שמירה. **מצופה:** אין alert שגיאה; הטבלה מתעדכנת ומופיעה רשומה חדשה (או הודעת הצלחה).
2. **D18 — עריכה:** לחיצה על "ערוך" בשורה → שינוי בשדה(ים) בטופס → שמירה. **מצופה:** הטבלה מתעדכנת עם הערכים החדשים.
3. **D21 — הוספה:** "הוסף תזרים" → מילוי טופס (חשבון, תאריך, סוג, סכום וכו') → שמירה. **מצופה:** אין alert "שגיאה בשמירת התזרים"; תזרים חדש בטבלה.
4. **D21 — עריכה:** "ערוך" בשורת תזרים → טופס עם נתונים → שינוי → שמירה. **מצופה:** עדכון בטבלה.
5. הרצת E2E: `node tests/phase2-e2e-selenium.test.js` — בדיקות CRUD_Buttons_D18 / CRUD_Buttons_D21 יכולות להישאר (מתעדות התנהגות); לאחר התיקון ניתן לצפות שאין alert שגיאה כאשר ממולא טופס תקין (או להתאים את הבדיקה ל"טופס נפתח" במקום "alert").

---

**Team 50 (QA & Fidelity)**  
**log_entry | TO_TEAM_30_FIX_REQUEST | CRUD_D18_D21_ADD_EDIT_FORMS | 2026-01-31**
