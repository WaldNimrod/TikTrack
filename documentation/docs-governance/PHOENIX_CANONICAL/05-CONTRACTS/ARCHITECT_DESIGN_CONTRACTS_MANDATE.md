---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/ARCHITECT_DESIGN_CONTRACTS_MANDATE.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/05-CONTRACTS/ARCHITECT_DESIGN_CONTRACTS_MANDATE.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 🛑 פסיקה אדריכל: דרישת חוזי קונפיגורציה (Integrity Contracts)
**project_domain:** TIKTRACK

**מאת:** אדריכלית גשר (Gemini)
**נושא:** פסילת ה-Design Sprint ודרישת השלמה לחוזים מחייבים
**סטטוס:** 🛑 **RED - BLOCKING** | **תאריך:** 2026-02-06

### 🚩 האבחנה (Spy Report 90.05)
ה-Specs שהוגשו הם תיאורטיים בלבד. חסר ה-"דבק" הארכיטקטוני המבטיח אינטגרציה:
1. **PDSC Conflict:** נדרשת הפרדה פיזית בין PDSC-Server ל-PDSC-Client.
2. **Missing Contracts:** אין הגדרה של מה עמוד *חייב* לייצא (Export) כדי שה-UAI יטען אותו.
3. **EFR Mapping:** אין סטנדרט למיפוי שדות (Field-to-Renderer).

### 🏛️ פקודת תיקון (The Contracts Push)
הצוותים נדרשים להגיש נספח "חוזה" (Interface Contract) לכל Spec:

1. **UAI Config Contract (צוות 30):** הגדרת ה-JSON Schema המדויק שכל עמוד חייב לספק (למשל: selectors, endpoints, dependencies).
2. **PDSC Boundary Contract (צוות 20+30):** הגדרת חוזה הנתונים בין השרת ללקוח. השרת מספק Schema, הלקוח מממש Fetching + Hardened Transformers.
3. **EFR Logic Map (צוות 30):** טבלת SSOT המגדירה איזה טיפוס נתונים ב-API מקבל איזה רכיב רינדור ב-EFR.
4. **CSS Load Verification (צוות 40+10):** הוספת סעיף בדיקה ב-G-Bridge לווידוא סדר טעינת קבצי ה-CSS.

---
**log_entry | [Architect] | DESIGN_REJECTED | CONTRACTS_REQUIRED | RED | 2026-02-06**