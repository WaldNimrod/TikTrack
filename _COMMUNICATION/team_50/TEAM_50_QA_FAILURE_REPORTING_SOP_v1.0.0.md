# Team 50 — נוהל: דיווח תקלות עם מידע מפורט לתיקון אופטימלי

**project_domain:** TIKTRACK | AGENTS_OS  
**id:** TEAM_50_QA_FAILURE_REPORTING_SOP_v1.0.0  
**owner:** Team 50 (QA & Fidelity)  
**status:** 🔒 **מחייב — בכל דיווח כשל/תקלה חוזרת**  
**date:** 2026-02-27  

---

## 1) עקרון

**במקרה של כשל בדיקה — ובמיוחד כשל חוזר — חובה להחזיר לצוותים מידע מפורט שמאפשר תיקון אופטימלי.** דיווח כללי ("נכשל", "500") ללא פרטים מעכב תיקונים ופוגע ביעילות. איכות ה-QA נמדדת גם ביכולת הצוותים לתקן במהירות על סמך הדיווח.

---

## 2) חובה — מה לכלול בכל דיווח תקלה

### 2.1 בקשת HTTP מדויקת

| שדה | דוגמה | חובה |
|-----|--------|------|
| **Method + URL** | `POST http://127.0.0.1:8082/api/v1/tickers` | ✅ |
| **Headers (מנוקים)** | `Content-Type: application/json`, `Authorization: Bearer <token>` (בלי להדפיס את ה-token המלא) | ✅ |
| **Body (גוף הבקשה)** | `{"symbol":"QA_D22_DEBUG_TEST","ticker_type":"STOCK","is_active":false}` | ✅ |

### 2.2 תשובת השרת המלאה

| שדה | דוגמה | חובה |
|-----|--------|------|
| **HTTP status** | `500` | ✅ |
| **Response body** | `{"detail":"Failed to create ticker","error_code":"SERVER_ERROR"}` | ✅ |
| **Headers רלוונטיים** | `content-type: application/json` | אם יש תועלת |

### 2.3 הקשר ריצה (Environment)

| פריט | דוגמה | חובה |
|------|--------|------|
| **אתחול שבוצע** | `scripts/fix-env-after-restart.sh` (כולל [3/6] P3-020) | ✅ |
| **מיגרציות** | `make migrate-p3-020` הורצה; פלט: "P3-020 migration complete" | אם רלוונטי |
| **Backend /health** | `200` לפני ריצת הבדיקה | מומלץ |

### 2.4 צעדי שחזור (Repro)

רשימה קצרה: איך להריץ את אותה הבדיקה בדיוק (פקודה או סקריפט + סדר פעולות).

### 2.5 צעדים להפקת מידע נוסף (בשגיאות 5xx)

אם התשובה היא 5xx ו־`detail` גנרי (למשל "Failed to create ticker"):

1. **המלצה לצוות המטפל:** להריץ Backend עם `DEBUG=true` ב־`api/.env` — ב־endpoints שתומכים (למשל `POST /tickers` — הוטמע ב־api/routers/tickers.py) ה־detail מחזיר אז `סוג_שגיאה: מסר` (עד 200 תווים).
2. **או:** לבדוק לוג Backend בעת הקריאה — השגיאה נרשמת ב־`logger.error(..., exc_info=True)` ומופיעה ב־stack trace.
3. **אם Team 50 יכול:** להריץ פעם אחת עם `DEBUG=true` (רק בסביבת פיתוח/QA), לתעד את שדה `detail` המלא בדוח התקלה, ולהסיר `DEBUG=true` אחר כך. **אזהרה:** לא להשאיר DEBUG=true ב־production.

---

## 3) תבנית קצרה לדיווח לצוות (Contract Request / Revalidation)

```markdown
## מידע מפורט לתיקון

**בקשה:**
- Method: POST
- URL: /api/v1/tickers
- Body: {"symbol":"<symbol>","ticker_type":"STOCK","is_active":false}

**תשובה:**
- HTTP: 500
- Body: {"detail":"Failed to create ticker","error_code":"SERVER_ERROR"}

**סביבה:** fix-env-after-restart.sh הורצה; P3-020 OK; /health 200.

**שחזור:** bash scripts/run-tickers-d22-qa-api.sh (לאחר אתחול).

**להשגת שגיאה מדויקת:** הרץ Backend עם DEBUG=true ב־api/.env או בדוק לוג Backend בעת POST /tickers.
```

---

## 4) שימוש בנוהל

- **כל תגובה ל-Team 20/30/60** על כשל API/UI — לכלול לפחות §2.1, §2.2, §2.4.
- **כשל חוזר** — לחייב גם §2.3 ו־§2.5.
- **עדכון דוחות קיימים:** אם נשלח דיווח כללי בעבר — להוסיף נספח "מידע מפורט לתיקון" לפי תבנית §3.

---

**log_entry | TEAM_50 | QA_FAILURE_REPORTING_SOP | v1.0.0_LOCKED | 2026-02-27**
