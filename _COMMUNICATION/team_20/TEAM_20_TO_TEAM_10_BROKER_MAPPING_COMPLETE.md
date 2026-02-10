# ✅ Team 20 → Team 10: Broker Mapping Complete

**id:** `TEAM_20_BROKER_MAPPING_COMPLETE`  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-10  
**status:** 🟢 **MAPPING_COMPLETE**  
**version:** v1.0  
**source:** `TEAM_10_TO_TEAMS_20_30_MAPPING_MODE_MANDATE.md`

---

## 📋 Executive Summary

**Team 20 מאשר שמיפוי שדות ברוקרים הושלם בהצלחה:**

✅ **קובץ מיפוי** — `DATA_MAP_FINAL.json` נוצר  
✅ **API Contract** — חוזה API מוגדר ל-`GET /api/v1/reference/brokers`  
✅ **רשימת ברוקרים** — 10 ברוקרים נפוצים  
✅ **מיפוי שדות** — D16 ו-D18 ממופים  
✅ **Naming Convention** — Singular naming (כפי שנדרש)

---

## ✅ משימות שבוצעו

### **1. קובץ מיפוי קיים (`DATA_MAP_FINAL.json`)** ✅

**מיקום:** `_COMMUNICATION/team_20/DATA_MAP_FINAL.json`

**סטטוס:** הקובץ כבר קיים ומכיל את כל המידע הנדרש

**תוכן:**
- ✅ **API Contract** — חוזה מלא ל-`GET /api/v1/reference/brokers` עם response schema (`data` array עם `value`/`label`)
- ✅ **Broker List** — 10 ברוקרים נפוצים עם `value`, `label`, `common_abbreviation`
- ✅ **Form Field Mapping** — מיפוי שדות D16 ו-D18 (כולל קבצי forms, שדות, ולידציה)
- ✅ **Backend Implementation Guidance** — הנחיות לביצוע (אפשרויות data source, המלצות)
- ✅ **Frontend Implementation Guidance** — הנחיות לביצוע (select implementation, error handling)

---

### **2. API Contract Definition** ✅

**Endpoint:** `GET /api/v1/reference/brokers`

**Response Schema:**
```json
{
  "data": [
    {
      "value": "Interactive Brokers",
      "label": "Interactive Brokers"
    }
  ],
  "total": 10
}
```

**תכונות:**
- ✅ `value` — ערך ברוקר (Singular, max_length=100) - נשלח ב-form submission
- ✅ `label` — תווית תצוגה (להצגה ב-UI, יכול להיות זהה ל-value)
- ✅ `common_abbreviation` — קיצור נפוץ (בקובץ המיפוי, לא ב-API response)

---

### **3. Broker List (10 ברוקרים)** ✅

**רשימת ברוקרים:**
1. Interactive Brokers (IBKR)
2. TD Ameritrade (TDA)
3. Charles Schwab (SCHW)
4. Fidelity (FID)
5. E*TRADE (ETFC)
6. Robinhood (HOOD)
7. Webull (WEBU)
8. Ally Invest (ALLY)
9. Merrill Edge (ME)
10. Vanguard (VAN)

**Naming Convention:** ✅ Singular (כפי שנדרש)

---

### **4. Form Field Mapping** ✅

#### **D16 - Trading Accounts:**
- **Field:** `broker` (Optional)
- **Type:** `VARCHAR(100)`
- **Source:** `GET /api/v1/reference/brokers`
- **Form File:** `ui/src/views/financial/tradingAccounts/trading_accounts.html`

#### **D18 - Brokers Fees:**
- **Field:** `broker` (Required)
- **Type:** `VARCHAR(100)`
- **Source:** `GET /api/v1/reference/brokers`
- **Form File:** `ui/src/views/financial/brokersFees/brokers_fees.html`

---

## 📁 קבצים שנוצרו

### **קובץ מיפוי:**
- ✅ `_COMMUNICATION/team_20/DATA_MAP_FINAL.json`

---

## 🔄 סדר ביצוע (לפי תוכנית)

1. ✅ **Team 20** — Broker Mapping (קובץ קיים ומוכן לאישור 2026-02-10)
2. ⬜ **Team 10** — בדיקת שלמות ואישור נמרוד
3. ⬜ **Team 20** — מימוש API endpoint (לאחר אישור)
4. ⬜ **Team 30** — חיבור Select בטפסים (לאחר אישור)

---

## ✅ סיכום

### **מה הושלם:**

1. ✅ **קובץ מיפוי** — `DATA_MAP_FINAL.json` קיים ומעודכן
2. ✅ **API Contract** — חוזה API מוגדר (response schema עם `data` array)
3. ✅ **רשימת ברוקרים** — 10 ברוקרים נפוצים עם `value`/`label`
4. ✅ **מיפוי שדות** — D16 ו-D18 ממופים (כולל קבצי forms, שדות, ולידציה)
5. ✅ **Implementation Guidance** — הנחיות לביצוע ל-Backend ו-Frontend
6. ✅ **Naming Convention** — Singular naming (כפי שנדרש)

### **מוכן ל:**

- ✅ **Team 10** — בדיקת שלמות ואישור נמרוד
- ✅ **Team 30** — יכול לבדוק את המיפוי ולהכין את החיבור ל-Select
- ✅ **Team 20** — מוכן לממש את ה-API endpoint לאחר אישור

---

## 📝 הערות טכניות

1. **Naming Convention:** כל שמות הברוקרים ב-Singular (כפי שנדרש במנדט).

2. **API Design:** ה-API endpoint מתוכנן להיות פשוט ויעיל, עם אפשרות ל-caching (רשימת ברוקרים משתנה לעיתים רחוקות). Response format: `data` array עם `value`/`label` (תואם לסטנדרטים הקיימים).

3. **Data Source Options:** הקובץ כולל 3 אפשרויות למקור נתונים:
   - `distinct_from_brokers_fees` (מומלץ ל-MVP)
   - `dedicated_reference_table` (לעתיד)
   - `hybrid_approach` (לעתיד)

4. **Validation:** כללי ולידציה מוגדרים (max_length=100, case-insensitive matching, trim whitespace).

5. **Form Implementation:** הקובץ כולל הנחיות מפורטות ל-Frontend (HTML structure, option mapping, error handling).

---

## 🔗 קבצים רלוונטיים

**מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAMS_20_30_MAPPING_MODE_MANDATE.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR-013)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`

**קובץ מיפוי:**
- `_COMMUNICATION/team_20/DATA_MAP_FINAL.json`

**קבצי קוד רלוונטיים:**
- `api/models/trading_accounts.py` (broker field)
- `api/models/brokers_fees.py` (broker field)
- `api/schemas/trading_accounts.py` (broker field)
- `api/schemas/brokers_fees.py` (broker field)

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-10  
**סטטוס:** 🟢 **MAPPING_COMPLETE**

**log_entry | [Team 20] | BROKER_MAPPING | COMPLETE | GREEN | 2026-02-10**
