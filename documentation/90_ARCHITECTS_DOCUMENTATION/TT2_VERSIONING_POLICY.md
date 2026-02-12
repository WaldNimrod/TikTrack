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
* **דוגמה:** אם SV = 2.x.x, כלל השכבות חייבות להיות 2.y.z.

## 🕹️ 2. ניהול שינויים (Manual vs Auto)
* **Major/Minor:** שינויים ברמות אלו מאושרים אך ורק ע"י ה-G-Lead (נמרוד).
* **Patch/Build:** מותרים לעדכון אוטומטי ע"י תהליכי Build ו-CI.

## 📊 3. ארטיפקטים מחייבים
* **Version Matrix:** מסמך SSOT המרכז את הגרסה הנוכחית של כל שכבה.
* **Audit Gate:** צוות 90 יפסול כל הגשה שבה גרסת השכבה חורגת מתקרת ה-SV.

**log_entry | [Architect] | VERSIONING_LOCKED | CEILING_RULE_ACTIVE | GREEN**