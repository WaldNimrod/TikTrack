# Team 30 → Team 10: אישור עמידה ב-ADR-016 (ניהול גרסאות)

**מאת:** Team 30 (Frontend Execution)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** TEAM_10_TO_ALL_TEAMS_ADR_016_VERSIONING_FULL_IMPLEMENTATION_MANDATE.md  

---

## 1. אימוץ הנוהל

Team 30 אימץ את נוהל ADR-016 ויישם את הדרישות הספציפיות לצוות.

---

## 2. דרישות — סטטוס

| # | דרישה | סטטוס |
|---|--------|--------|
| 1 | **גרסת UI Package** — מקור יחיד: `ui/package.json` | ✅ |
| 2 | **גרסת Routes** — מקור יחיד: `ui/public/routes.json`; dist נוצר ב-build | ✅ (Vite מעתיק מ-public ל-dist) |
| 3 | **קוד שמציג/בודק גרסה** — קריאה מ-routes.json / package.json, ללא ערך קשיח | ✅ תוקן: הסרת `'1.1.2'` מ-Shared_Services.js |
| 4 | **ציות ל-Ceiling** — בתיעוד/דוחות: פורמט SV-prefixed | ✅ |

---

## 3. תיקון שבוצע

**קובץ:** `ui/src/components/core/Shared_Services.js`

**לפני:** השוואה לגרסה קשיחה `'1.1.2'` — הפרת דרישה 3.  
**אחרי:** בדיקת נוכחות שדה `version` ב-routes.json בלבד; אין ערך צפוי קשיח.

---

## 4. מקורות גרסה (SSOT)

| סוג | קובץ |
|-----|------|
| גרסת UI | `ui/package.json` → `version` |
| גרסת Routes | `ui/public/routes.json` → `version` |

**הערה:** `ui/dist/routes.json` נוצר אוטומטית ב-build (Vite מעתיק מ-public) — אסור לעדכן ידנית.

---

## 5. רפרנסים

- **נוהל:** `documentation/10-POLICIES/TT2_VERSIONING_POLICY.md`
- **מטריצה:** `documentation/10-POLICIES/TT2_VERSION_MATRIX.md`
- **נוהל מימוש:** `documentation/05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md`

---

**Team 30 (Frontend Execution)**  
**log_entry | ADR_016 | COMPLIANCE_ACKNOWLEDGED | 2026-02-12**
