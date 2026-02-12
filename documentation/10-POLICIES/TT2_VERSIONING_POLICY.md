# 📜 נוהל משילות: ניהול גרסאות אחוד (Versioning Policy)

**id:** ADR-016  
**owner:** Architect  
**status:** LOCKED  
**context:** Governance / Release Integrity  
**מקור:** TT2_VERSIONING_POLICY.md (Google Drive) — אושר ונעול ע"י האדריכלית.

---

## 🏛️ 1. חוק ה-Ceiling (תקרת המערכת)

הגרסה המערכתית (**System Version - SV**) היא מקור האמת היחיד.

* **החוק:** אף שכבה (API, UI, DB, Routes) לא רשאית לעלות מעל גרסת ה-**Major** של המערכת.
* **דוגמה:** אם SV = 2.x.x, כלל השכבות חייבות להיות 2.y.z.

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
