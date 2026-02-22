# 📜 נוהל משילות: ניהול גרסאות אחוד (Versioning Policy)
**project_domain:** TIKTRACK

**id:** ADR-016  
**owner:** Architect  
**status:** LOCKED  
**context:** Governance / Release Integrity  
**מקור:** קבצי האדריכלית — `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSIONING_POLICY.md` (או Google Drive) — אושר ונעול ע"י האדריכלית.

**הערה:** בנוסח המקורי של האדריכלית הדוגמה הייתה SV = 2.x.x. גרסת המערכת **הנוכחית** נקבעה ע"י G-Lead כ-**1.0.0** — Ceiling 1.x.x. כלל Ceiling והכללים זהים.

---

## 🏛️ 1. חוק ה-Ceiling (תקרת המערכת)

הגרסה המערכתית (**System Version - SV**) היא מקור האמת היחיד.

* **החוק:** אף שכבה (API, UI, DB, Routes) לא רשאית לעלות מעל גרסת ה-**Major** של המערכת.
* **דוגמה:** אם SV = 1.x.x (גרסה ראשית 1.0), כלל השכבות חייבות להיות 1.y.z. (במקור האדריכלית: דוגמה 2.x.x → 2.y.z — אותו עקרון.)

---
## ✅ פורמט גרסה אחוד (Composite Version)
מספר הגרסה של כל שכבה יוצג עם תחילית ה‑SV:

**פורמט:** `SV.Major.SV.Minor.LayerMajor.LayerMinor.LayerPatch`  
**דוגמה (DB 2.5.0 תחת SV=1.0):** `1.0.2.5.0`

**כללים:**
- התחילית `SV.Major.SV.Minor` נעולה עד שינוי SV בהוראת G‑Lead.
- חוק ה‑Ceiling נאכף על **תחילית ה‑SV** (הגרסה המוצגת). ה‑LayerMajor יכול להמשיך להתקדם **רק בתוך** הפורמט המוקדם‑SV.
- **בתיעוד ובמטריצות:** גרסה שכבתית מוצגת **רק** בפורמט SV-prefixed (ללא חריגים).

---

## 🕹️ 2. ניהול שינויים (Manual vs Auto)

* **Major/Minor:** שינויים ברמות אלו מאושרים **אך ורק** ע"י ה-**G-Lead** (נמרוד).
* **Patch/Build:** מותרים לעדכון **אוטומטי** ע"י תהליכי Build ו-CI.

---

## 📍 3. קישורים בתיעוד

| מסמך | תיאור |
|------|--------|
| [TT2_VERSION_MATRIX.md](./TT2_VERSION_MATRIX.md) | מטריצת גרסאות נוכחית (שכבות, Ceiling, סטטוס) |
| [TT2_VERSIONING_PROCEDURE.md](../05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md) | נוהל מימוש ובדיקה (תוכנית, צוות 90, עדכון מטריצה) |

---

**log_entry | [Architect] | VERSIONING_LOCKED | GREEN**
