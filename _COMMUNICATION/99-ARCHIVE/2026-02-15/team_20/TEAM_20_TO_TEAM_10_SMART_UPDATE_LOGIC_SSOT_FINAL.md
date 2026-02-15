# Team 20 → Team 10: הודעת עדכון סופית — Smart Update Logic (תיקוני SSOT)

**id:** `TEAM_20_TO_TEAM_10_SMART_UPDATE_LOGIC_SSOT_FINAL`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-14  
**status:** נעול — ממתין להגשה לאדריכלית  
**מקור אמת:** TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC, MARKET_DATA_PIPE_SPEC §5, TEAM_20_TO_ARCHITECT_SMART_UPDATE_LOGIC_PROPOSAL

---

## 1. מבוא

הודעה זו מנעלת את תיקוני ה‑SSOT שבוצעו במסגרת **Smart Update Logic**.  
המידע מתועד ומאושר; בסיום — יש להגיש את מסמך ההצעה לבדיקת צוות האדריכלות.

---

## 2. סיכום תיקונים שבוצעו (נעול)

| # | תיקון | מיקום | תוצאה |
|---|--------|--------|--------|
| 1 | **Cache-First threshold 200→250** | `api/integrations/market_data/cache_first_service.py` | `len(rows) >= trading_days` (250) — SSOT: MIN_HISTORY_DAYS |
| 2 | **Retry policy** | מסמך ההצעה §6.1, §8, §11 | "ניסיון מיידי אחד + Batch לילה" — ללא סתירות |
| 3 | **force_reload 403 ל־USER** | `api/routers/tickers.py` L115, L129–136 | `require_admin_role` + guard מפורש `if mode==force_reload and !is_admin → 403` |
| 4 | **validate_only** | מסמך ההצעה §6.3, §11, §12 | הוסר — data-integrity כבר DB-only, Admin-only |
| 5 | **History wording** | מסמך ההצעה §1.2 | "Gap-First ברירת מחדל; Reload Admin ל־splits/dividends" |

---

## 3. קבצים שעודכנו (לנעילה בתיעוד)

| קובץ | שינוי |
|------|--------|
| `api/integrations/market_data/cache_first_service.py` | Cache HIT threshold 200→250 |
| `_COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_UPDATE_LOGIC_PROPOSAL.md` | Retry, validate_only, History, Cache-First 250 |
| `_COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md` | 200+→250+ בתיאור זרימה קיימת |
| `documentation/05-REPORTS/artifacts/TEAM_10_SMART_HISTORY_FILL_SSOT_EVIDENCE_LOG.md` | §6 תיקוני SSOT — Smart Update Logic |

---

## 4. אישור לממוש התוכנית

תוכנית **Smart Update Logic** (TEAM_20_TO_ARCHITECT_SMART_UPDATE_LOGIC_PROPOSAL) מתועדת ותואמת ל‑SSOT.  
**מאושר** לעדכון בתיעוד — ללא סטיות.  
מימוש התוכנית (כל הפריטים בטבלת היישום §12) — **מאושר לביצוע** לאחר אישור אדריכלית.

---

## 5. הפניות לתיעוד הנעול

| מסמך | נתיב |
|------|------|
| מסמך ההצעה (מתוקן) | `_COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_UPDATE_LOGIC_PROPOSAL.md` |
| אפיון Smart History Fill (נעול) | `_COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md` |
| Evidence Log | `documentation/05-REPORTS/artifacts/TEAM_10_SMART_HISTORY_FILL_SSOT_EVIDENCE_LOG.md` §6 |

---

## 6. פעולות נדרשות מצוות 10

1. **לנעול** את המידע בתיעוד (Index, OPEN_TASKS, Evidence) — **בוצע** ב־Evidence Log §6.
2. **בסיום** — להגיש את מסמך ההצעה (`TEAM_20_TO_ARCHITECT_SMART_UPDATE_LOGIC_PROPOSAL.md`) **לבדיקת צוות האדריכלות**.
3. **QA** — לאשר ש־USER מקבל 403 ב־`POST /api/v1/tickers/{id}/history-backfill?mode=force_reload`.

---

## 7. קריטריוני הצלחה (לאימות)

| קריטריון | סטטוס |
|----------|--------|
| מסמך מתוקן תואם SSOT ללא סטיות | ✅ |
| Evidence Log מעודכן | ✅ |
| QA מאשר 403 ל־USER | נדרש |

---

**log_entry | TEAM_20 | TO_TEAM_10 | SMART_UPDATE_LOGIC_SSOT_FINAL | 2026-02-14**  
**log_entry | TEAM_20 | LOCK | SSOT_FIXES_APPLIED | DOCUMENTATION_READY_FOR_ARCHITECT_SUBMISSION**
