# 🏛️ מבנה ארגוני והגדרת צוותים - פרויקט הפניקס (v2.4)

**id:** `PHOENIX_ORGANIZATIONAL_STRUCTURE`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-09  
**version:** v2.4

---
## 1. הסביבה האדריכלית (Gemini)
| צוות | שם תפקיד | אחריות |
| :--- | :--- | :--- |
| **G-Lead** | אדריכל ראשי (נמרוד) | חזון ובקרה סופית. |
| **G-Bridge** | אדריכל גשר ובקרה | ולידציה ותקשורת. |
| **צוות 01** | אדריכלות Frontend | תכנון ממשק וחוזים. |
| **צוות 02** | אדריכלות Backend | תכנון SQL ושרת. |
---
## 2. הסביבה הקבלנית (Cursor)
| צוות | ייעוד | תפקיד |
| :--- | :--- | :--- |
| **צוות 10** | The Gateway | המתזמר והמסנכרן. |
| **צוות 20** | Backend & DB | מימוש FastAPI/SQL. |
| **צוות 30** | Frontend Execution | Containers: לוגיקה עסקית, State, קריאות API — על גבי רכיבי Presentational. |
| **צוות 40** | UI Assets & Design | Presentational: Blueprints → רכיבי React Pixel Perfect; בעלות בלעדית על CSS ומראה ויזואלי. |
| **צוות 50** | QA & Fidelity | ולידציה, Evidence, בדיקות QA. |
| **צוות 60** | DevOps & Platform | תשתיות Build, סביבות, Deployment. |

---
## 3. אמנת שירות צוות 30 ↔ 40

**מסמך מחייב:** [TT2_SLA_TEAMS_30_40.md](../05-PROCEDURES/TT2_SLA_TEAMS_30_40.md) — דיוק אחריות Presentational (40) vs Container (30).