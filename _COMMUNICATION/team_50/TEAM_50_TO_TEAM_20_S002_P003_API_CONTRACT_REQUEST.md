# Team 50 → Team 20: בקשת תאום API — S002-P003 D22 (Tickers)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST  
**from:** Team 50 (QA / FAV)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 10, Team 30  
**date:** 2026-02-27  
**status:** COORDINATION_ISSUED  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  
**trigger:** ריצת scripts/run-tickers-d22-qa-api.sh (דוח TEAM_50_TO_TEAM_10_S002_P003_WP002_FAV_COMPLETION_REPORT §2.1); Team 10 דורש תאום per TEAM_10_S002_P003_WP002_FAV_COMPLETION_ACK §3.

---

## 1) מטרה

הודעת תאום רשמית ל־Team 20 בעקבות ריצת FAV על D22 (Tickers). חלק מהקריאות נכשלו; נדרש אימות/תיקון צד שרת כדי לאפשר GATE_4 PASS.

---

## 2) ממצאים (מתוך ריצת run-tickers-d22-qa-api.sh)

| # | Endpoint / פעולה | תוצאה בפועל | ציפייה (חוזה) |
|---|-------------------|-------------|----------------|
| 1 | **GET /tickers?ticker_type=STOCK** | 500 | 200 + JSON (רשימת טיקרים מסוננים) |
| 2 | **POST /tickers** | SERVER_ERROR — "Failed to create ticker", no id | 201 + body עם id (או validation ברור) |
| 3 | **GET /tickers/:id** | 307 / 404 | 200 + JSON (טיקר בודד) |
| 4 | **PUT /tickers/:id** | 307 / 404 | 200 + JSON (עדכון) |
| 5 | **DELETE /tickers/:id** | 307 / 404 | 204 או 200 (מחיקה) |

**הערות:** (1) 500 על `ticker_type=STOCK` — ייתכן באג ב־service/layer. (2) POST — ייתכן constraint ב־DB או validation שחסר. (3) 307 — ייתכן redirect (trailing slash / base path); 404 — ייתכן routing ל־:id.

---

## 3) בקשת פעולה (Team 20)

- לאמת את ההתנהגות הנוכחית של `api/routers/tickers.py` (ושירותים קשורים) מול הממצאים לעיל.
- לתקן או להחזיר תשובה עקבית per חוזה D22 (TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION).
- לאחר תיקון — להודיע ל־Team 10 (או ל־Team 50) כדי ש־Team 50 יריץ שוב FAV וידווח על PASS.

---

## 4) רפרנסים

- _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P003_WP002_FAV_COMPLETION_REPORT.md (§2.1)
- _COMMUNICATION/team_10/TEAM_10_S002_P003_WP002_FAV_COMPLETION_ACK.md (§3)
- _COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION.md

---

**log_entry | TEAM_50 | TO_TEAM_20 | S002_P003_API_CONTRACT_REQUEST | COORDINATION_ISSUED | 2026-02-27**
