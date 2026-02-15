# Team 10 → Team 60: בקשת הגשת Seal (SOP-013) — חבילת External Data

**id:** `TEAM_10_TO_TEAM_60_EXTERNAL_DATA_SEAL_REQUEST`  
**from:** Team 10 (The Gateway)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**re:** סגירה פורמלית — Governance v2.102 (SOP-013)  
**סטטוס:** 🔒 **מחייב — נדרש להשלמת סגירה רשמית**

---

## 1. רקע

תוצרי חבילת External Data (P3-011, P3-016, P3-017) **התקבלו** — טבלת Intraday, FX EOD Sync, Cleanup Jobs + Evidence; מסמך תיאום ל־Team 20 נמסר.  
ברשימת המשימות המרכזית המשימות מופיעות כ־**PENDING_VERIFICATION**.

לפי **SOP-013:** סגירה רשמית (CLOSED) תירשם **רק** עם **הודעת Seal (SOP-013)** — לא דוח בלבד.

---

## 2. בקשה

**נא להגיש הודעת Seal (SOP-013)** המסגירה את המשימות הבאות:

| משימה | תיאור |
|-------|--------|
| **P3-011** | FX EOD Sync (Alpha→Yahoo) |
| **P3-016** | Intraday Table + Migration (`ticker_prices_intraday`) |
| **P3-017** | Cleanup Jobs + Evidence |

---

## 3. דרישות למסמך ה-Seal

1. **כותרת ברורה** — הודעת Seal (SOP-013); לא "דוח השלמה".  
2. **הצהרה** — שמסמך זה הוא Seal לפי הנוהל (הפניה ל־TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md).  
3. **טבלת משימות** — רשימת P3-011, P3-016, P3-017 + Evidence לכל אחת.  
4. **Log Entry** — שורת log_entry בסגנון: `log_entry | [Team 60] | EXTERNAL_DATA_SEAL | TO_TEAM_10 | GREEN | YYYY-MM-DD`

**דוגמה למבנה:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_PRE_BATCH_3_SEAL_MESSAGE.md`  
**נוהל:** `documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md`

---

## 4. אחרי הגשת ה-Seal

Team 10 יעדכן את **TEAM_10_MASTER_TASK_LIST** — שלוש המשימות → **CLOSED** עם תאריך סגירה, וישלח **אישור קבלה (ACK)**.

---

## 5. Evidence קיים (לשילוב ב-Seal)

- TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION.md  
- TEAM_10_TO_TEAM_60_EXTERNAL_DATA_DELIVERABLES_ACK.md  
- scripts/migrations/p3_016_create_ticker_prices_intraday.sql  
- scripts/sync_exchange_rates_eod.py  
- scripts/cleanup_market_data.py  
- Makefile: sync-eod, cleanup-market-data  

---

**log_entry | TEAM_10 | TO_TEAM_60 | EXTERNAL_DATA_SEAL_REQUEST | 2026-02-13**
