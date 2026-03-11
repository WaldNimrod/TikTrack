# GIN-001 | השלמות מידע — מחירים ונתוני שוק

**project_domain:** TIKTRACK  
**id:** TEAM_10_GIN_001_PRICE_AND_MARKET_DATA_CLARIFICATIONS  
**from:** Team 10 (The Gateway)  
**to:** Team 20, Team 30, Team 00 (Architect)  
**date:** 2025-01-30  
**historical_record:** true
**context:** ממצאים 1, 2, 5, 6 — PRE_DEVELOPMENT_GATE

---

## 1) שאלות מידע

### 1.1 מחיר נוכחי vs מחיר סגירה (ממצא 5)

| # | שאלה | נדרש לתשובה |
|---|------|-------------|
| Q1.1 | **מתי** current_price ≠ last_close_price? (שעות שוק פתוח / סגור; ימים חגים) | כלל מפורש לוגי |
| Q1.2 | **מה** להציג כאשר שניהם שווים — תווית ברורה למשתמש? (למשל: "סגירה מאתמול") | טקסט UI סופי |
| Q1.3 | **איפה** במודל הנתונים נקבע ההבחנה — Backend (API response) או Frontend (חישוב) | החלטה אדריכלית |

### 1.2 בורסה ת"א — אגורות (ממצא 6)

| # | שאלה | נדרש לתשובה |
|---|------|-------------|
| Q2.1 | **איפה** לחלק ב־100 — בשכבת API (לפני DB) או ב־UI בלבד? | החלטה אדריכלית |
| Q2.2 | **אילו** שדות מושפעים — current_price, last_close_price, היסטוריה? | רשימה מפורשת |
| Q2.3 | **איך** לזהות בורסה ת"א — לפי exchange_id / exchange_code / סימבול (.TA)? | כלל זיהוי |

### 1.3 price_source ו־price_as_of_utc (ממצאים 1, 2)

| # | שאלה | נדרש לתשובה |
|---|------|-------------|
| Q3.1 | **מדוע** מוחזר null — חסר EOD? חסר intraday? תקלת סנכרון? | רשימת סיבות + remedial flows |
| Q3.2 | **תנאי מינימלי** — מה חייב להיות לא־null כדי שהטיקר לא יקבל רמזור אדום? | כלל מפורש |

---

## 2) תוצרים נדרשים

| תוצר | בעלים | פורמט |
|------|--------|-------|
| **PRICE_SEMANTICS_SSOT** (או עדכון קיים) | Team 00 / 90 | מסמך: current vs last_close; TASE; price_source |
| **TASE_CONVERSION_DECISION** | Team 00 | החלטה: Backend / Frontend; שדות מושפעים |
| **API schema / field notes** | Team 20 | הערות בשדות price לצורך Frontend |

---

## 3) חתימת קבלה

| תפקיד | שם | תאריך |
|-------|-----|-------|
| Architect / Product | | |
| Team 20 | | |
| Team 30 | | |

**Team 10 לא יאשר פיתוח ממצאים 1, 2, 5, 6 עד לקבלת תשובות.**

---

**log_entry | TEAM_10 | GIN_001 | PRICE_MARKET_DATA | 2025-01-30**
