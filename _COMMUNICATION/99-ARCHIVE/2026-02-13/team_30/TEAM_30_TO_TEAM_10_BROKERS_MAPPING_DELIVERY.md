# 📦 Team 30 → Team 10: מסירת מיפוי ברוקרים (MAPPING_MODE)

**מאת:** Team 30 (Frontend) בשיתוף Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**סטטוס:** ✅ **מסירה — תוקן לפי דרישת Team 10 — ממתין לאישור ויזואלי (נמרוד)**  
**מקור:** `TEAM_10_TO_TEAMS_20_30_MAPPING_MODE_MANDATE.md`  
**עדכון לאחר תיקון:** `TEAM_10_TO_TEAMS_20_30_BROKER_MAPPING_CORRECTION_REQUEST.md` — תיקונים בוצעו ב־`DATA_MAP_FINAL.json` (Team 20); דוח השלמה: `TEAM_20_TO_TEAM_10_BROKER_MAPPING_CORRECTION_COMPLETE.md`, `TEAM_30_TO_TEAM_10_BROKER_MAPPING_CORRECTION_COMPLETE.md`.

---

## 1. סיכום המסירה

✅ **קובץ מיפוי הוגש:** `_COMMUNICATION/team_20/DATA_MAP_FINAL.json`

קובץ זה מכיל מיפוי משותף של צוותים 20 ו-30 עבור:
- חוזה API עבור `GET /api/v1/reference/brokers`
- מיפוי שדות UI בטפסים D16 ו-D18
- רשימת ברוקרים תקפים (reference data)
- הנחיות יישום ל-Backend ו-Frontend

---

## 2. תוכן הקובץ

### 2.1 חוזה API (Team 20)

| פריט | תוכן |
|------|------|
| **Endpoint** | `GET /api/v1/reference/brokers` |
| **Authentication** | Required (JWT Bearer Token) |
| **Response Schema** | `{ data: [{ value: string, label: string }], total: number }` |
| **Field Naming** | Singular (`broker`), `value` = form value, `label` = UI display |

**דוגמת תגובה:**
```json
{
  "data": [
    { "value": "Interactive Brokers", "label": "Interactive Brokers" },
    { "value": "TD Ameritrade", "label": "TD Ameritrade" },
    { "value": "Charles Schwab", "label": "Charles Schwab" },
    { "value": "Fidelity", "label": "Fidelity" },
    { "value": "E*TRADE", "label": "E*TRADE" },
    { "value": "Robinhood", "label": "Robinhood" },
    { "value": "Webull", "label": "Webull" },
    { "value": "Ally Invest", "label": "Ally Invest" },
    { "value": "Merrill Edge", "label": "Merrill Edge" },
    { "value": "Vanguard", "label": "Vanguard" }
  ],
  "total": 10
}
```

### 2.2 מיפוי UI (Team 30)

| טופס | שדה | סוג נוכחי | סוג יעד | חובה |
|------|------|-----------|---------|------|
| **D16 Trading Accounts** | `broker` | text input | dynamic select | לא |
| **D18 Brokers Fees** | `broker` | text input | dynamic select | כן |

**קבצים לעדכון:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`
- `ui/src/views/financial/brokersFees/brokersFeesForm.js`

### 2.3 רשימת ברוקרים תקפים

הקובץ כולל רשימת ברוקרים ראשונית (10 ברוקרים נפוצים):
- Interactive Brokers
- TD Ameritrade
- Charles Schwab
- Fidelity
- E*TRADE
- Robinhood
- Webull
- Ally Invest
- Merrill Edge
- Vanguard

**הערה:** הרשימה היא reference בלבד. ה-API בפועל יקבע את מקור הנתונים (distinct מ-`brokers_fees` או טבלת reference).

---

## 3. אחריות יישום

### 3.1 Team 20 (Backend)

- [ ] מימוש `GET /api/v1/reference/brokers` endpoint
- [ ] הגדרת סכמת תגובה תואמת לחוזה
- [ ] קביעת מקור נתונים (distinct מ-`brokers_fees` או טבלת reference)
- [ ] אכיפת אימות (JWT Bearer token)
- [ ] החזרת פורמט עקבי (value/label)

**המלצה:** התחלה עם `SELECT DISTINCT broker FROM brokers_fees` ל-MVP, שיקול טבלת reference לעתיד.

### 3.2 Team 30 (Frontend)

- [ ] החלפת text input ב-select dropdown ב-D16
- [ ] החלפת text input ב-select dropdown ב-D18
- [ ] טעינת רשימת ברוקרים מ-API בעת טעינת טופס
- [ ] מיפוי תגובת API (value/label) לאפשרויות select
- [ ] טיפול בשגיאות API (הצגת הודעת שגיאה, ללא fallback ל-text input)

---

## 4. תאימות

✅ **Singular Naming:** שדות ב-Singular (`broker`, לא `brokers`)  
✅ **Phoenix Bible:** תואם ל-PHOENIX_MASTER_BIBLE  
✅ **ADR-013:** תואם להחלטת אדריכל (Broker List = API-based)  
✅ **Max Length:** 100 תווים (תואם ל-DB schema)

---

## 5. הערות חשובות

1. **מקור נתונים:** הקובץ מציע 3 אפשרויות למקור נתונים. ההחלטה הסופית תהיה ב-Team 20.
2. **Fallback:** במקרה של כשל ב-API, יש להציג הודעת שגיאה למשתמש. **אין** fallback ל-text input / manual entry (תואם ADR-013: מקור רשימת ברוקרים חייב להיות API בלבד). שדה ה-select יישאר מושבת עד שהקריאה ל-API תצליח.
3. **Caching:** מומלץ לשקול caching של רשימת ברוקרים ב-Frontend (sessionStorage או memory) להפחתת קריאות API ושיפור ביצועים.
4. **D16 Optional:** שדה `broker` ב-D16 הוא אופציונלי — יש לכלול אפשרות ריקה ב-select.

---

## 6. לאחר אישור

לאחר אישור ויזואלי (נמרוד):
- Team 20 יתחיל מימוש ה-API endpoint
- Team 30 יתחיל החלפת text inputs ב-select dropdowns
- קידוד יתבצע לפי `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` (משימה 1, שלב 2)

---

**Team 30 (Frontend) + Team 20 (Backend)**  
**log_entry | BROKERS_MAPPING_DELIVERY | DELIVERED | 2026-02-10**
