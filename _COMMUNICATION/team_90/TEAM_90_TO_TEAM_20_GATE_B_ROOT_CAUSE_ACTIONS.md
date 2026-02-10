# 🕵️ Team 90 → Team 20: Gate B Root‑Cause Actions (Backend)

**id:** `TEAM_90_TO_TEAM_20_GATE_B_ROOT_CAUSE_ACTIONS`  
**from:** Team 90 (The Spy)  
**to:** Team 20 (Backend Implementation)  
**date:** 2026-02-07  
**status:** 🔴 **ACTION REQUIRED**  
**context:** Gate B / SOP‑010 — E2E failures persist  

---

## 🎯 Objective
סגירת כשלי Backend שמחזירים 400 ומפילים את E2E, כדי לאפשר GREEN ב‑Gate B.

**תחקיר מלא (Internal):**  
`_COMMUNICATION/team_90/TEAM_90_GATE_B_E2E_ROOT_CAUSE_AND_ACTION_REPORT.md`

**Policy (Server Start):**  
`_COMMUNICATION/team_90/TEAM_90_TO_ALL_TEAMS_SERVER_START_POLICY.md`

---

## 🔴 Required Actions (No Alternatives)

### 1) `brokers_fees/summary` — 400 Bad Request (Blocking)
**בעיה:** ה‑endpoint מחזיר 400 גם כש‑filters אמורים להיות optional.

**ביצוע חובה:**
- לאפשר קריאות ללא פרמטרים (ברירת מחדל) ולהחזיר 200.
- לוודא שכל filters אופציונליים (broker / commission_type / search) אינם מחייבים.
- להוסיף לוג קל לאימות הפרמטרים שנשלחים בריצת QA.

**קבצים רלוונטיים:**
- `api/routers/brokers_fees.py`
- `api/services/brokers_fees_service.py`

---

### 2) `cash_flows/currency_conversions` — handling when trading_account_id absent
**בעיה:** כש‑`tradingAccountId` לא נשלח, עדיין נדרש ULID ומתקבל 400.

**ביצוע חובה:**
- לאפשר `trading_account_id` להיות `null`/absent ולהחזיר 200 עם תוצאה כללית/empty.

**קבצים רלוונטיים:**
- `api/services/cash_flows.py`
- `api/routers/cash_flows.py`

---

## ✅ Acceptance Criteria (Team 20)
- `GET /api/v1/brokers_fees/summary` מחזיר 200 גם ללא פרמטרים.
- `GET /api/v1/cash_flows/currency_conversions` מחזיר 200 כאשר `trading_account_id` לא נשלח.

---

## 🔬 Point Tests (לאחר תיקון)
1) קריאה ל‑`brokers_fees/summary` ללא פרמטרים ⇒ 200.
2) קריאה ל‑`cash_flows/currency_conversions` ללא `trading_account_id` ⇒ 200.

---

## 📌 Handoff
לאחר תיקון: לעדכן את Team 50 לביצוע ריצה חוזרת ולהעביר תוצאות ל‑Team 90.

**Prepared by:** Team 90 (The Spy)
