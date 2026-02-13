# 📩 עדכון רשמי — trading_accounts/summary: SSOT REQUIRED (LOCKED)

**מאת:** Team 10 (The Gateway / SSOT)  
**אל:** כל הצוותים (20, 30, 40, 50, 60, 90)  
**תאריך:** 2026-02-07  
**נושא:** trading_accounts/summary — SSOT REQUIRED  
**סטטוס:** 🔒 **LOCKED**

---

## ✅ החלטה (ננעלה)

**Endpoint:** `GET /api/v1/trading_accounts/summary`  
**סטטוס ב-SSOT:** **REQUIRED** — אין אופציה להסרה או לאלטרנטיבה.

- SSOT ננעל עם REQUIRED.
- אין אזכור תקף להסרה או לאלטרנטיבה; מסמכים היסטוריים שציינו "הסרה" או "אלטרנטיבה" עודכנו/סומנו כמבוטלים בהחלטה.

---

## 📋 אימות SSOT ו-Docs

### SSOT
- **קובץ:** `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`  
- **סעיף:** § Endpoint Decision — trading_accounts/summary (LOCKED)  
- **תוכן:** Endpoint REQUIRED; Backend מיושם; Config ו-Docs חייבים להכריז עליו. No removal, no alternative.

### Docs ו-Mandates
- `TEAM_10_GATE_B_ARCHITECT_DECISION_IMPLEMENTATION.md` — כולל trading_accounts/summary = REQUIRED  
- `TEAM_10_GATE_B_MANDATE_TEAM_20.md` — נדרש (לא מבוטל); תיעוד SSOT  
- `TEAM_10_GATE_B_MANDATE_TEAM_30.md` — summary endpoint = trading_accounts/summary  
- `TEAM_10_GATE_B_MANDATE_TEAM_90.md` — Endpoints Integrity כולל trading_accounts/summary  
- `05-REPORTS/artifacts/TEAM_10_GATE_B_EVIDENCE_LOG.md` — Endpoint Decision REQUIRED  

### Config
- `ui/src/views/financial/tradingAccounts/tradingAccountsPageConfig.js` — `dataEndpoints` ו-`summary.endpoint` כוללים `trading_accounts/summary`

---

## 📌 Acceptance Criteria (מאומת)

- [x] SSOT ננעל עם REQUIRED  
- [x] אין אזכור תקף להסרה/אלטרנטיבה ב-SSOT וב-Docs/Mandates הרלוונטיים  
- [x] עדכון רשמי הופץ לכל הצוותים (מסמך זה)

---

**log_entry | [Team 10] | TRADING_ACCOUNTS_SUMMARY | SSOT_REQUIRED_LOCKED | 2026-02-07**
