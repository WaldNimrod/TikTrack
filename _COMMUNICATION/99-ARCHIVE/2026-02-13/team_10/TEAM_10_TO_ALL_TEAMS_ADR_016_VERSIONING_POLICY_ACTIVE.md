# Team 10 → כל הצוותים: נוהל ניהול גרסאות (ADR-016) פעיל

**מאת:** Team 10 (The Gateway)  
**אל:** כל הצוותים (20, 30, 40, 50, 60, 90)  
**תאריך:** 2026-01-30  
**נושא:** ADR-016 — ניהול גרסאות אחוד (Versioning Policy) — תיעוד פעיל ומימוש

---

## 1. הודעה

נוהל **ניהול גרסאות אחוד (ADR-016)** אושר ונעול ע"י האדריכלית. התיעוד הוטמע במערכת והנוהל **פעיל** מחייב.

**כל צוות מחויב:**
- להכיר את הנוהל ואת חוק ה-**Ceiling** (אף שכבה לא מעל ה-Major של System Version).
- **לא** לעדכן Major/Minor בשכבה שלו ללא **אישור G-Lead** (נמרוד).
- Patch/Build מותרים לעדכון אוטומטי (Build/CI) בלבד.

---

## 2. מיקום התיעוד (SSOT)

| מסמך | נתיב |
|------|------|
| **נוהל משילות (ADR-016)** | `documentation/10-POLICIES/TT2_VERSIONING_POLICY.md` |
| **מטריצת גרסאות** | `documentation/10-POLICIES/TT2_VERSION_MATRIX.md` |
| **נוהל מימוש** | `documentation/05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md` |
| **אינדקס (קישור לנוהל)** | `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` — סעיף "ניהול גרסאות (ADR-016)" |

---

## 3. בדיקה

**בדיקת תאימות גרסאות** (אימות שכל השכבות מתחת ל-Ceiling) תבוצע **רק ע"י Team 90** — ללא כתיבת קוד, אימות ודיווח בלבד. מנדט נפרד נשלח ל-Team 90.

---

## 4. תמצית כללים + פורמט אחיד (SV-prefixed)

- **System Version (SV)** = מקור האמת; כרגיל **SV = 1.0** (LOCKED).
- **פורמט גרסה בתיעוד:** כל שכבה מוצגת עם תחילית SV — `SV.Major.SV.Minor.LayerMajor.LayerMinor.LayerPatch` (דוגמה: 1.0.2.5.0). **אין גרסה שכבתית בלי תחילית SV במסמכי משילות.**
- **חוק Ceiling:** אף שכבה לא מציגה Major מעל SV Major.
- **Major/Minor:** רק באישור G-Lead. **Patch/Build:** מותר אוטומטי.

---

**log_entry | TEAM_10 | ADR_016_VERSIONING_POLICY_ACTIVE | ALL_TEAMS | 2026-01-30**
