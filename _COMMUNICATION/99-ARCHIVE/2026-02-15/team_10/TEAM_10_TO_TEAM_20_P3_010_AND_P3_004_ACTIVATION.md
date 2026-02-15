# Team 10 → Team 20: הפעלה — P3-010 (Cadence + Ticker Status) + P3-004 (אימות ADR-022)

**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend & DB)  
**date:** 2026-02-15  
**re:** רשימת המשימות המרכזית — סגירת P3-010, השלמת P3-004  
**מקור:** TEAM_10_OPEN_TASKS_CLOSURE_PLAN_AND_ACTIVATION.md

---

## 1. תוכנית כללית

שתי משימות פתוחות ברשימה המרכזית דורשות את צוות 20:

- **P3-010** — External Data M4: Cadence + Ticker Status (מימוש + Seal).
- **P3-004** — ADR-022 + POL-015 Enforcement (אימות — Provider Lock, Cache-first, אין Frankfurter).

---

## 2. P3-010 — Cadence + Ticker Status

**מקור החלטה:** TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md §6 — Cadence Policy per Ticker Status: Active = intraday, inactive = EOD; מקור אמת: **is_active_flags**; System Settings cadence config ב־MARKET_DATA_PIPE_SPEC.

**תלות:** Team 10 יעדכן את ה-SSOT (MARKET_DATA_PIPE_SPEC — cadence config לפי domain + status). **אחרי** עדכון SSOT:

| פעולה | תוצר |
|--------|------|
| מימוש cadence לפי סטטוס טיקר (Active → intraday, inactive → EOD) | קוד מתיישר ל-SSOT |
| Evidence קצר | רשימת שינויים / קישור לקבצים |
| **סגירה** | **הודעת Seal (SOP-013)** — לא דוח בלבד. פורמט: PHOENIX TASK SEAL עם TASK_ID: P3-010, FILES_MODIFIED, PRE_FLIGHT, HANDOVER_PROMPT. |

**מסמכים:** MARKET_DATA_PIPE_SPEC.md (לאחר עדכון Team 10); TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md (documentation/09-GOVERNANCE).

---

## 3. P3-004 — אימות ADR-022 (חלק Backend)

**מקור:** TEAM_90_TO_TEAM_10_ADR_022_AND_POL_015_1_ENFORCEMENT.md.  
מימוש Provider Interface, Cache-first, Guardrails — כבר בוצעו ב־P3-008, P3-009 (CLOSED). נדרש **אימות** ל-Gate B:

| קריטריון | פעולה נדרשת |
|----------|-------------|
| **אין Frankfurter** | וידוא שאין אזכור ל-Frankfurter בקוד/תצורה. |
| **Cache-first מאומת** | וידוא: אין קריאה ל-API חיצוני לפני בדיקת DB/Cache. |
| **Provider Interface לפי config** | וידוא: בחירת ספקים דרך config בלבד. |

**תוצר:** דוח אימות קצר (או סעיף בתוך Seal אם תגישו Seal משולב ל־P3-004) — בתיקיית _COMMUNICATION/team_20/.

---

## 4. סדר ביצוע מומלץ

1. **המתנה** לעדכון SSOT מ-Team 10 ל־P3-010 (Cadence ב־MARKET_DATA_PIPE_SPEC).
2. **P3-010** — מימוש cadence + Evidence; הגשת **Seal (SOP-013)** לסגירת P3-010.
3. **P3-004** — אימות ADR-022 (Frankfurter, Cache-first, Provider config); דוח אימות או הכללה ב-Seal.

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| תוכנית סגירה | _COMMUNICATION/team_10/TEAM_10_OPEN_TASKS_CLOSURE_PLAN_AND_ACTIVATION.md |
| Gaps (Cadence §6) | _COMMUNICATION/team_90/TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md |
| Enforcement (ADR-022) | _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_ADR_022_AND_POL_015_1_ENFORCEMENT.md |
| SOP-013 (Seal) | documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md |

---

**log_entry | TEAM_10 | TO_TEAM_20 | P3_010_AND_P3_004_ACTIVATION | 2026-02-15**
