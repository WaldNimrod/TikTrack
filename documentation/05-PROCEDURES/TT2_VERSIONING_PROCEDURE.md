# 📋 נוהל מימוש: ניהול גרסאות (ADR-016)

**id:** TT2_VERSIONING_PROCEDURE  
**owner:** Team 10 (The Gateway)  
**מבוסס על:** [TT2_VERSIONING_POLICY.md](../10-POLICIES/TT2_VERSIONING_POLICY.md) (ADR-016) — LOCKED. מקור: קבצי האדריכלית ב-`documentation/90_ARCHITECTS_DOCUMENTATION/` (TT2_VERSIONING_POLICY.md, TT2_VERSION_MATRIX.md).  
**סטטוס:** מחייב ממועד פרסום.

---

## 1. מטרה

ליישם את נוהל ניהול הגרסאות (ADR-016) בפרויקט: שמירה על **תקרת גרסה מערכתית (SV)** בכל השכבות, חלוקת אחריות לעדכון גרסאות, ואימות תאימות **על ידי Team 90 בלבד** (ללא כתיבת קוד — בדיקה ודיווח).

---

## 2. עקרונות (תמצית מהנוהל)

| כלל | תיאור |
|-----|--------|
| **Ceiling** | אף שכבה לא עולה מעל ה-Major של System Version (SV). |
| **Major/Minor** | מאושרים **רק** ע"י G-Lead (נמרוד). |
| **Patch/Build** | מותרים לעדכון אוטומטי (Build/CI). |

### פורמט גרסה אחוד (SV-prefixed)
כל שכבה מציגה גרסה בפורמט:  
`SV.Major.SV.Minor.LayerMajor.LayerMinor.LayerPatch`  
לדוגמה: DB 2.5.0 תחת SV=1.0 → `1.0.2.5.0`.

---

## 3. מיקומי גרסאות בקוד (לצורך אימות)

| Layer | מיקום בפרויקט |
| :--- | :--- |
| **System Version (SV)** | קובץ **`VERSION`** (שורש הפרויקט); תיעוד — [TT2_VERSION_MATRIX.md](../10-POLICIES/TT2_VERSION_MATRIX.md) |
| **API Layer** | `api/__init__.py` — `__version__` **וגם** `api/main.py` — `FastAPI(..., version="...")` (חובה התאמה) |
| **Database Schema** | תיעוד DDL (גרסה בשם/תיעוד סכמה, למשל 2.5) |
| **UI Package** | `ui/package.json` — שדה `"version"` |
| **Routes Config** | `ui/public/routes.json` — שדה `"version"` |

---

## 4. תוכנית מימוש

1. **הטמעת נוהל בתיעוד**  
   - נוהל ומטריצה ב-`documentation/10-POLICIES/`.  
   - נוהל מימוש (מסמך זה) ב-`documentation/05-PROCEDURES/`.  
   - קישור מאינדקס המאסטר.

2. **הודעות צוותים**  
   - Team 10 מעביר לכל הצוותים: נוהל ADR-016 פעיל, מיקום המסמכים, חובת ציות ל-Ceiling.  
   - Team 10 מעביר ל-**Team 90**: מנדט ביצוע **בדיקת תאימות גרסאות** (אין כתיבת קוד — אימות ודיווח בלבד).

3. **עדכון גרסאות בשכבות**  
   - עדכוני **Major/Minor** רק אחרי **אישור G-Lead**.  
   - עדכון **Patch/Build** מותר בתהליכי Build/CI.  
   - עדכון **מטריצת גרסאות** אחרי כל שינוי מאושר (מטופל על ידי Team 10 או לפי הנחיית G-Lead).

4. **בדיקה (Team 90)**  
   - Team 90 מריץ **אימות תאימות**: קריאת גרסאות ממיקומי הקוד + מטריצה, וידוא שאין שכבה מעל ה-SV Major (כרגיל SV = 1.0 → Ceiling 1.x.x).  
   - דיווח: תוצר בדיקה (למשל דוח קצר או עדכון מטריצה עם סטטוס Aligned / PENDING BUMP).  
   - **לא נדרש:** שינוי קוד על ידי Team 90 — רק בדיקה ודיווח.

---

## 5. יישום יציב בפרויקט — מה נדרש

כדי שהנוהל ייושם בפועל בצורה יציבה ומסודרת (מעבר להפצת הידע לצוותים):

| # | דרישה | סטטוס / פעולה |
|---|--------|----------------|
| 1 | **מקור יחיד לגרסה בכל שכבה** | ✅ API: `api/__init__.py` (SSOT), `main.py` משתמש ב-`__version__`. UI: `ui/package.json`. Routes: **רק** `ui/public/routes.json` — `ui/dist/routes.json` נוצר ב-build (Vite), לא לעדכן ידנית. |
| 2 | **מקור יחיד ל-SV (System Version)** | ✅ קובץ `VERSION` בשורש הפרויקט (תוכן: 1.0.0). תיעוד ומטריצה מתייחסים אליו. סקריפטים/CI יכולים לקרוא ממנו. |
| 3 | **Checklist לעדכון גרסה (שחרור / Bump)** | בעדכון Major/Minor: אישור G-Lead; אחריו לעדכן לפי הסדר: (א) `VERSION` אם השתנה SV, (ב) `api/__init__.py`, (ג) `ui/package.json`, (ד) `ui/public/routes.json` אם רלוונטי, (ה) מטריצת גרסאות + תיעוד. Patch/Build: רק קבצי השכבה הרלוונטית + מטריצה. |
| 4 | **אין גרסאות כפולות בקוד** | לא להגדיר גרסה בא יותר ממקום אחד לשכבה (למשל API רק ב-`__init__.py`). קוד שבודק/מציג גרסה — לקרוא מקובץ/משתנה אחד (routes.json, package.json, __version__). |
| 5 | **אימות תקופתי** | Team 90 מריץ אימות תאימות לפי מנדט; מטריצה מתעדכנת אחרי כל שינוי גרסה מאושר. |

**הערה:** עדכון `ui/dist/routes.json` — רק דרך Build (למשל `npm run build`), לא עריכת קובץ ידנית. מקור האמת: `ui/public/routes.json`.

---

## 6. אחריות לפי המבנה הארגוני

לפי [PHOENIX_ORGANIZATIONAL_STRUCTURE.md](../00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md):

| פעולה / נדרש | אחראי |
|---------------|--------|
| **תיאום, תיעוד, הפצה** — נוהל, מטריצה, נוהל מימוש, הודעות צוותים | **Team 10** (The Gateway) |
| **קובץ `VERSION`** (עדכון אחרי אישור G-Lead ל-SV) | **Team 10** |
| **מטריצת גרסאות** — עדכון אחרי כל שינוי גרסה מאושר | **Team 10** |
| **עדכון גרסה בשכבת API** — `api/__init__.py` (וידוא ש-`main.py` משתמש ב-`__version__`) | **Team 20** (Backend & DB) |
| **עדכון גרסה בשכבת DB** — תיעוד DDL / סכמה | **Team 20** |
| **עדכון גרסה ב-UI** — `ui/package.json`, `ui/public/routes.json` | **Team 30** (Frontend Execution) |
| **Build ותשתית** — וידוא ש-`ui/dist/routes.json` נוצר מ-build (לא עדכון ידנית) | **Team 60** (DevOps & Platform) |
| **אימות תאימות גרסאות** — קריאת גרסאות ממיקומי הקוד, השוואה למטריצה, דיווח | **Team 90** (The Spy) — בדיקה ודיווח בלבד, ללא כתיבת קוד |
| **אישור Major/Minor** (כולל שינוי SV) | **G-Lead** (נמרוד) בלבד |

**סיכום:** Team 10 מנהל את הנוהל והתיעוד ומעדכן את המטריצה וקובץ VERSION; Team 20 מטפל בגרסאות API ו-DB; Team 30 בגרסאות UI ו-Routes; Team 60 מטפל ב-Build; Team 90 מבצע אימות ודיווח; G-Lead מאשר Major/Minor.

---

## 7. הפניות

| מסמך | נתיב |
|------|------|
| נוהל משילות (ADR-016) | [TT2_VERSIONING_POLICY.md](../10-POLICIES/TT2_VERSIONING_POLICY.md) |
| מטריצת גרסאות | [TT2_VERSION_MATRIX.md](../10-POLICIES/TT2_VERSION_MATRIX.md) |
| מקור SV (קובץ) | `VERSION` (שורש הפרויקט) |
| מבנה ארגוני | [PHOENIX_ORGANIZATIONAL_STRUCTURE.md](../00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md) |
| אינדקס מאסטר | [00_MASTER_INDEX.md](../00-MANAGEMENT/00_MASTER_INDEX.md) — סעיף ניהול גרסאות |

---

**log_entry | TEAM_10 | TT2_VERSIONING_PROCEDURE | PUBLISHED**
