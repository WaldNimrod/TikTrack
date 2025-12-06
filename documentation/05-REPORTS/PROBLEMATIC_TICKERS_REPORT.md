# דוח טיקרים בעייתיים

**תאריך:** 6 בדצמבר 2025  
**גרסה:** 1.0.0

---

## סיכום כללי

- **🔴 טיקרים חסרי quote נוכחי:** 1
- **🟡 טיקרים עם נתונים היסטוריים חסרים (< 150 quotes):** 63
- **📊 סה"כ טיקרים עם בעיות:** 64

---

## 🔴 טיקרים חסרי quote נוכחי (קריטי)

### 1. NOVN (ID: 1618)
- **Symbol:** NOVN
- **Name:** Novartis AG
- **בעיה:** חסר quote נוכחי לגמרי
- **Status Code:** 404 (NO_QUOTE_DATA)
- **הודעה:** "No quote data available for ticker NOVN"
- **המלצה:** "Data may not have been fetched yet. Try refreshing the data."
- **עדיפות:** 🔴 גבוהה (high)
- **פרטים נוספים:**
  - Currency: None
  - Exchange: None

**פעולה נדרשת:**
- רענון נתונים לטיקר זה דרך `/api/external-data/quotes/1618/refresh`
- בדיקת symbol mapping (אולי צריך NOVN.SW או פורמט אחר)
- בדיקת ספק נתונים (Yahoo Finance)

---

## 🟡 טיקרים עם נתונים היסטוריים חסרים

**בעיה:** יש רק 1 quote היסטורי במקום 150 הנדרשים

### רשימה מלאה (63 טיקרים):

1. **SAN** (ID: 1615) - יש quote נוכחי (מחיר: 85.0) ✅
2. **SIE** (ID: 1616)
3. **UL** (ID: 1617)
4. **SAP** (ID: 1619)
5. **MS** (ID: 1592)
6. **DIA** (ID: 1564)
7. **LOW** (ID: 1568)
8. **SBUX** (ID: 1576)
9. **COST** (ID: 1574)
10. **TSLA** (ID: 1557)
11. **ABBV** (ID: 1591)
12. **PFE** (ID: 1560)
13. **AXP** (ID: 1554)
14. **ASML** (ID: 1597)
15. **MA** (ID: 1573)
16. **BMW** (ID: 1600)
17. **JPM** (ID: 1584)
18. **TGT** (ID: 1566)
19. **HD** (ID: 1593)
20. **VOO** (ID: 1555)
21. **ועוד 43 טיקרים...**

**פעולה נדרשת:**
- רענון נתונים היסטוריים לכל הטיקרים דרך `/api/external-data/quotes/{id}/refresh` עם `include_historical: true`
- או רענון קבוצתי דרך `/api/external-data/refresh/full`

---

## ניתוח בעיות

### בעיה 1: NOVN - חסר quote נוכחי

**סיבות אפשריות:**
1. Symbol לא נכון - אולי צריך `NOVN.SW` (Swiss Exchange) או פורמט אחר
2. ספק נתונים לא יכול למצוא את הטיקר
3. נתונים לא נטענו מעולם
4. בעיית symbol mapping במערכת

**פתרונות:**
1. לבדוק את symbol mapping ב-`TickerSymbolMappingService`
2. לנסות לטעון ידנית דרך Yahoo Finance עם symbol אחר
3. לבדוק את ה-exchange של הטיקר (אולי צריך להוסיף)
4. לרוץ refresh עם force_refresh: true

### בעיה 2: 63 טיקרים עם נתונים היסטוריים חסרים

**סיבות אפשריות:**
1. נתונים היסטוריים לא נטענו מעולם
2. טעינה חלקית (רק quote נוכחי)
3. בעיית symbol mapping (חלק מהטיקרים לא נמצאו)
4. בעיית ספק נתונים (Yahoo Finance לא החזיר נתונים היסטוריים)

**פתרונות:**
1. רענון קבוצתי דרך `/api/external-data/refresh/full`
2. בדיקת symbol mapping לכל הטיקרים
3. בדיקת ספק נתונים (Yahoo Finance)
4. טעינה ידנית של נתונים היסטוריים

---

## המלצות לתיקון

### עדיפות גבוהה (קריטי):

1. **תיקון NOVN (ID: 1618)**
   - בדיקת symbol mapping
   - רענון נתונים עם force_refresh
   - בדיקת exchange (אולי צריך להוסיף)

2. **רענון נתונים היסטוריים לכל הטיקרים**
   - שימוש ב-`/api/external-data/refresh/full`
   - או רענון קבוצתי דרך External Data Dashboard

### עדיפות בינונית:

3. **בדיקת symbol mapping**
   - לוודא שכל הטיקרים ממופים נכון
   - לבדוק אם יש טיקרים שצריכים suffix (כמו .SW, .DE, וכו')

4. **בדיקת ספק נתונים**
   - לוודא ש-Yahoo Finance עובד נכון
   - לבדוק אם יש rate limiting
   - לבדוק אם יש טיקרים שלא נתמכים

---

## טיקרים שצריך לבדוק במיוחד

### טיקרים עם quote נוכחי אבל בלי היסטורי:
- **TSLA** (ID: 1557) - Tesla - חשוב
- **BMW** (ID: 1600) - BMW - נזכר בדוחות קודמים כבעייתי
- **JPM** (ID: 1584) - JPMorgan Chase - חשוב
- **COST** (ID: 1574) - Costco - חשוב
- **SBUX** (ID: 1576) - Starbucks - חשוב

### טיקרים אירופאיים (אולי בעיית symbol):
- **SAN** (ID: 1615) - Santander (ספרד)
- **SIE** (ID: 1616) - Siemens (גרמניה)
- **UL** (ID: 1617) - Unilever (בריטניה/הולנד)
- **SAP** (ID: 1619) - SAP (גרמניה)
- **NOVN** (ID: 1618) - Novartis (שוויץ) - **חסר quote לגמרי**

**הערה:** טיקרים אירופאיים עשויים לדרוש suffix כמו `.DE`, `.SW`, `.L`, וכו'

---

## צעדים לביצוע

1. **רענון NOVN:**
   ```bash
   curl -X POST "http://127.0.0.1:8080/api/external-data/quotes/1618/refresh" \
     -H "Content-Type: application/json" \
     -d '{"force_refresh": true, "include_historical": true, "days_back": 150}'
   ```

2. **רענון קבוצתי:**
   - פתיחת External Data Dashboard
   - לחיצה על "רענון כל הטיקרים" או "טעינת נתונים מלאה"

3. **בדיקת symbol mapping:**
   - לבדוק את `TickerSymbolMappingService`
   - לוודא שכל הטיקרים ממופים נכון

---

**גרסה:** 1.0.0  
**תאריך עדכון אחרון:** 6 בדצמבר 2025

