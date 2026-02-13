# ✅ צ'קליסט הגשה חוזרת לשער ב' — 1-001 / 1-003 / 1-004

**id:** `TEAM_10_PRE_GATE_B_CHECKLIST_1_001_1_003_1_004`  
**מטרה:** לוודא שכל התיקונים הנדרשים בוצעו **לפני** הגשה חוזרת ל־Team 90 — כדי למנוע חסימה חוזרת.  
**מקור:** `TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md`  
**תאריך:** 2026-02-13

---

## מצב נוכחי (עדכון אחרון)

- **Team 30 — EOD:** ✅ הושלם. דוח: `team_30/TEAM_30_TO_TEAM_10_ADR_022_POL_015_ENFORCEMENT_COMPLETION_REPORT.md`. זמין ל־Gate B עבור 1-001.
- **Team 20 — P3-005:** ✅ טיוטת FOREX (`TEAM_20_P3_005_FOREX_MARKET_SPEC_UPDATE_DRAFT.md`), יישור קוד, דוח השלמה (`TEAM_20_P3_005_FOREX_ALIGNMENT_COMPLETE.md`). **P3-006:** ממתין ל־Precision Policy SSOT מ־Team 10.
- **Team 60:** ✅ הודעת קבלה (`TEAM_60_TO_TEAM_10_P3_006_MANDATE_ACKNOWLEDGMENT.md`). ממתין ל־Precision Policy SSOT; אחריו — יישור DB + Evidence.
- **עדכון:** **Team 10** — G1, G3 הושלמו. **P3-006 הושלם:** 20 — Models תואמים; Field Maps: טיוטה נמסרה, Team 10 החיל עדכונים ב־documentation/01-ARCHITECTURE/LOGIC/ (WP_20_08_C CASH_FLOWS, TRADES, TRADING_ACCOUNTS, BALANCES). Evidence התקבל. 60 — מיגרציה brokers_fees.minimum 20,6 + Evidence + דוח השלמה. **הושלם:** G2, G4–G6. **שער ב' — PASS:** TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md. 1-001, 1-003, 1-004 → CLOSED ברשימת המשימות.

---

## ניהול תהליך — חלוקת משימות (Team 10)

**מנדטים נשלחו לצוותים — חובה דיווח חזרה לפני הגשת Gate-B:**

| צוות | מסמך מנדט | תוצרים נדרשים | התקבל |
|------|------------|----------------|--------|
| **Team 20** | `TEAM_10_TO_TEAM_20_P3_005_P3_006_MANDATE.md` | תרומה/עדכון FOREX_MARKET_SPEC; יישור קוד FOREX; יישור Field Maps + Models ל־Precision; Evidence P3-006 | ☑ P3-005 הושלם. P3-006 הושלם — Models תואמים; טיוטת Field Maps; Team 10 החיל ב־documentation/LOGIC/; Evidence: TEAM_20_P3_006_PRECISION_EVIDENCE.md |
| **Team 60** | `TEAM_10_TO_TEAM_60_P3_006_MANDATE.md` | יישור DB/Schema ל־Precision Policy; Evidence P3-006 | ☑ הושלם — מיגרציה brokers_fees.minimum 20,6; TEAM_60_P3_006_PRECISION_EVIDENCE.md; TEAM_60_TO_TEAM_10_P3_006_COMPLETION_REPORT.md |
| **Team 30** | `TEAM_10_TO_TEAM_30_P3_005_EOD_GATE_B_DELIVERABLE.md` (+ מנדט ADR-022) | אזהרה ויזואלית EOD ב־UI; דוח ביצוע | ☑ הושלם. דוח: `team_30/TEAM_30_TO_TEAM_10_ADR_022_POL_015_ENFORCEMENT_COMPLETION_REPORT.md` |

**אחריות Team 10 (Gateway) — תוצרים פנימיים:**

| # | משימה | בוצע |
|---|--------|------|
| G1 | פרסום **מסמך Precision Policy SSOT** (מפת 20,8 vs 20,6 לכל ישות) — תנאי מקדים ל־20 ו־60 | ☑ `documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md` |
| G2 | מיזוג טיוטת 20 ל־**FOREX_MARKET_SPEC.md** (קובץ SSOT ב־documentation) — מקור: `team_20/TEAM_20_P3_005_FOREX_MARKET_SPEC_UPDATE_DRAFT.md` | ☑ הוחל — §2.1–2.5 (ADR-022) |
| G3 | לאחר נעילת Precision — עדכון **CASH_FLOW_PARSER_SPEC.md** (שדה amount) | ☑ amount = NUMERIC(20,6); תלות PRECISION_POLICY_SSOT |
| G4 | מעקב תוצרים: סימון "התקבל" בטבלת המנדטים למעלה | ☑ 20, 60 P3-006 מסומנים התקבל |
| G5 | Evidence log ב־05-REPORTS/artifacts (לפי נוהל) | ☑ documentation/05-REPORTS/artifacts/TEAM_10_STAGE1_1_001_1_003_1_004_PRE_GATE_B_EVIDENCE_LOG.md |
| G6 | הגשת **בקשת Gate-B מחדש** ל־90 רק לאחר G1–G5 + כל תוצרי 20/60/30 | ☑ TEAM_10_TO_TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_RE_REQUEST.md |

---

## כלל: סדר ביצוע

1. **קודם** P3-006 (Precision Policy) — כי 1-003 תלוי בהחלטת Precision.  
2. **במקביל/אחרי** P3-005 (FOREX_MARKET_SPEC).  
3. **אחרי** שני אלה — עדכון CASH_FLOW_PARSER_SPEC (1-003) לפי Precision.  
4. **רק אז** — הגשת Gate-B מחדש ל־90.

---

## 1) 1-001 — FOREX_MARKET_SPEC (P3-005)

| # | דרישה | צוות אחראי | בוצע |
|---|--------|-------------|------|
| 1.1 | עדכון `FOREX_MARKET_SPEC.md`: Providers = **Yahoo + Alpha בלבד** (אין Frankfurter) | Team 10 או Team 20 | ☑ טיוטה: `team_20/TEAM_20_P3_005_FOREX_MARKET_SPEC_UPDATE_DRAFT.md`. נדרש מ־10: העלאה ל־SSOT. |
| 1.2 | במסמך: **FX EOD בלבד** + Primary/Fallback (Alpha → Yahoo) | Team 10 או Team 20 | ☑ בטיוטה. |
| 1.3 | במסמך: **Cache-First** — no external call before local cache | Team 10 או Team 20 | ☑ בטיוטה. |
| 1.4 | במסמך: **Visual warning** כאשר מוצג EOD | Team 10 או Team 20 | ☑ בטיוטה (staleness). |
| 1.5 | במסמך: **Scope מטבעות** — USD/EUR/ILS נעול | Team 10 או Team 20 | ☑ בטיוטה. |
| 1.6 | קוד/שרת מיושר למסמך (Cache-First, EOD, providers) | Team 20 | ☑ דוח: `team_20/TEAM_20_P3_005_FOREX_ALIGNMENT_COMPLETE.md`. |
| 1.7 | אזהרה ויזואלית ל־EOD ב־Unified Shell (לפי ADR-022) | Team 30 | ☑ הושלם (eodWarningBanner, eodStalenessCheck; trading_accounts, brokers_fees, cash_flows). |
| 1.8 | Evidence / חתימה ש־SSOT מעודכן ומיושר | Team 10 | ☑ FOREX_MARKET_SPEC.md מעודכן (G2). |

---

## 2) 1-004 — Precision Audit (P3-006)

| # | דרישה | צוות אחראי | בוצע |
|---|--------|-------------|------|
| 2.1 | **מסמך SSOT Precision Policy** — מפת החלטות 20,8 vs 20,6 לכל ישות (כולל cash_flows.amount, brokers_fees.minimum וכו') | Team 10 | ☑ PRECISION_POLICY_SSOT.md |
| 2.2 | יישור **Field Maps** ל־Precision Policy | Team 20 | ☑ טיוטה מ־20; Team 10 החיל ב־documentation/01-ARCHITECTURE/LOGIC/ |
| 2.3 | יישור **Models** (מודלים) ל־Precision Policy | Team 20 | ☑ כבר תואמים — ללא שינוי קוד |
| 2.4 | יישור **DB/Schema** ל־Precision Policy (כולל brokers_fees.minimum וכו') | Team 60 | ☑ מיגרציה 20,8→20,6 הורצה; Evidence נוצר |
| 2.5 | **Evidence חדש** מ־Team 20 — Precision Audit לאחר יישור | Team 20 | ☑ TEAM_20_P3_006_PRECISION_EVIDENCE.md |
| 2.6 | **Evidence חדש** מ־Team 60 — Precision Audit לאחר יישור | Team 60 | ☑ TEAM_60_P3_006_PRECISION_EVIDENCE.md |
| 2.7 | רישום Evidence ב־Master Task List / 05-REPORTS | Team 10 | ☑ Evidence log ב־05-REPORTS/artifacts; רשימה מעודכנת |

---

## 3) 1-003 — CASH_FLOW_PARSER (אחרי 1-004)

| # | דרישה | צוות אחראי | בוצע |
|---|--------|-------------|------|
| 3.1 | החלטת Precision נעולה (מסמך Precision Policy קיים) | — | ☑ PRECISION_POLICY_SSOT |
| 3.2 | עדכון `CASH_FLOW_PARSER_SPEC.md`: שדה `amount` — NUMERIC לפי ההחלטה (20,8 או 20,6) | Team 10 או Team 20 | ☑ amount = NUMERIC(20,6) |
| 3.3 | Evidence / הערה ש־Spec מיושר ל־Precision | Team 10 | ☑ תלות ל־PRECISION_POLICY_SSOT ב־Spec |

---

## 4) לפני שליחת בקשת Gate-B מחדש ל־90

| # | פעולה | אחראי |
|---|--------|--------|
| 4.1 | כל התיבות בסעיפים 1–3 מסומנות כבוצע | Team 10 |
| 4.2 | Evidence logs מעודכנים ב־05-REPORTS/artifacts (לפי נוהל) | Team 10 |
| 4.3 | עדכון Master Task List: 1-001, 1-003, 1-004 → PENDING_VERIFICATION (או CLOSED אחרי שער ב') | Team 10 |
| 4.4 | שליחת **בקשת Gate-B מחדש** ל־Team 90 (מסמך ייעודי) עם הפניה ל־Evidence ולמסמכי SSOT המעודכנים | Team 10 |

---

## 5) סיכום — מה נדרש מכל צוות לפני הגשה חוזרת

- **Team 10:** מסמך Precision Policy SSOT; עדכון FOREX_MARKET_SPEC (או תיאום עם 20); עדכון CASH_FLOW_PARSER_SPEC לאחר Precision; Evidence log; צ'קליסט זה.
- **Team 20:** יישור Field Maps + Models ל־Precision; יישור קוד/שרת ל־FOREX (Cache-First, EOD, providers); Evidence Precision חדש; תרומה לעדכון FOREX/CASH_FLOW specs אם רלוונטי.
- **Team 30:** אזהרה ויזואלית ל־EOD ב־Unified Shell (ADR-022).
- **Team 60:** יישור DB/Schema ל־Precision Policy; Evidence Precision חדש.

**log_entry | TEAM_10 | PRE_GATE_B_CHECKLIST_CREATED | 2026-02-13**  
**log_entry | TEAM_10 | PRE_GATE_B_CHECKLIST | DELIVERABLES_RECEIVED | 2026-02-13**  
**log_entry | TEAM_10 | PRE_GATE_B_CHECKLIST | G1_G3_COMPLETED | 2026-02-13**  
**log_entry | TEAM_10 | PRE_GATE_B_CHECKLIST | P3_006_20_60_COMPLETE | 2026-02-13** — 20: Models תואמים; Field Maps טיוטה → Team 10 החיל ב־documentation/LOGIC/. Evidence התקבל. 60: מיגרציה brokers_fees.minimum 20,6; Evidence + דוח השלמה. נותר: G2 (FOREX), G5 (Evidence log), G6 (Gate B). — Precision Policy SSOT פורסם (PRECISION_POLICY_SSOT.md); יישור הכול לפי SSOT ו-DB. CASH_FLOW_PARSER_SPEC עודכן (amount 20,6). 20 ו־60 ממשיכים יישור P3-006 + Evidence. — 30: EOD הושלם (דוח ADR_022_POL_015_ENFORCEMENT_COMPLETION_REPORT). 20: P3-005 הושלם (טיוטה FOREX_MARKET_SPEC_UPDATE_DRAFT, יישור קוד, TEAM_20_P3_005_FOREX_ALIGNMENT_COMPLETE); P3-006 ממתין ל־Precision Policy SSOT. 60: TEAM_60_TO_TEAM_10_P3_006_MANDATE_ACKNOWLEDGMENT — ממתין ל־SSOT. חסימה נוכחית: Team 10 — פרסום Precision Policy SSOT (G1) + מיזוג טיוטת FOREX ל־SSOT (G2).
