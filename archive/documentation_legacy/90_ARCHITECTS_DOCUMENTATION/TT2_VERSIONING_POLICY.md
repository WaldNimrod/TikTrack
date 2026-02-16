---
id: ADR-016
owner: Architect
status: LOCKED
context: Governance / Release Integrity
---

# 📜 נוהל משילות: ניהול גרסאות אחוד (Versioning Policy)

## 🏛️ 1. חוק ה-Ceiling (תקרת המערכת)
הגרסה המערכתית (System Version - SV) היא מקור האמת היחיד. 
* **החוק:** אף שכבה (API, UI, DB, Routes) לא רשאית לעלות מעל גרסת ה-Major של המערכת.
* **דוגמה:** אם SV = 1.x.x, כלל השכבות חייבות להיות 1.y.z.

### ✅ פורמט גרסה אחוד (Composite Version)
מספר הגרסה של כל שכבה יוצג **עם תחילית SV**:

**פורמט:** `SV.Major.SV.Minor.LayerMajor.LayerMinor.LayerPatch`  
**דוגמה (DB 2.5.0 תחת SV=1.0):** `1.0.2.5.0`

**כללים:**
- התחילית `SV.Major.SV.Minor` **נעולה** עד שינוי SV בהוראת G‑Lead.
- חוק ה‑Ceiling נאכף על **תחילית ה‑SV** (הגרסה המוצגת). ה‑LayerMajor יכול להמשיך להתקדם **רק בתוך** הפורמט המוקדם‑SV.
- קידום Minor/Major של SV מתבצע **רק** באישור G‑Lead.

## 🕹️ 2. ניהול שינויים (Manual vs Auto)
* **Major/Minor:** שינויים ברמות אלו מאושרים אך ורק ע"י ה-G-Lead (נמרוד).
* **Patch/Build:** מותרים לעדכון אוטומטי ע"י תהליכי Build ו-CI.

**SV נוכחי:** 1.0.0 (ראה מטריצת גרסאות).  
**log_entry | [Architect] | VERSIONING_LOCKED | GREEN**
