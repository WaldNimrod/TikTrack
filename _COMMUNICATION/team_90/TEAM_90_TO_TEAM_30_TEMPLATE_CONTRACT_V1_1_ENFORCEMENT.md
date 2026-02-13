# 🕵️ Team 90 → Team 30: Enforcement — Page Template Contract v1.1

**id:** `TEAM_90_TO_TEAM_30_TEMPLATE_CONTRACT_V1_1_ENFORCEMENT`  
**from:** Team 90 (The Spy)  
**to:** Team 30 (Frontend Execution)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — ARCHITECT LOCKED**

---

## מקור ההכרעה (LOCKED)
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md`

---

## מה השתנה
- **אין חריגות לעמודי Auth (Login/Register/Reset).**  
- חייבת להיות **תבנית HTML אחת גמישה** לכל Type A/B/C/D דרך **UAI config**.

---

## דרישות ביצוע (חובה)
1. עדכון תבנית Unified Shell כך שתתמוך ב‑Type A/B/C/D ללא חריגות.  
2. update ל‑Template Factory scripts:
   - `ui/scripts/generate-pages.js`
   - `ui/scripts/validate-pages.js`
   - ולידציה חייבת לכלול עמודי Auth.
3. Evidence: הרצת validate-pages.js עם PASS לכל עמוד Non‑Auth + Auth.

---

## Acceptance Criteria
- אין עמוד Auth שמדלג על התבנית.  
- ה‑UAI config שולט על Layout Type ולא קיים fork בתבניות.  
- validate-pages.js עובר ב‑PASS לכלל העמודים.

---

**log_entry | TEAM_90 | TEMPLATE_CONTRACT_V1_1_ENFORCEMENT | 2026-02-13**
