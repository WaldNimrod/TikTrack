# MB3A (Notes → Alerts) — קונטקסט, תאום ופרומטי הפעלה לפי סדר ביצוע

**id:** TEAM_10_MB3A_CONTEXT_AND_ACTIVATION_PROMPTS  
**owner:** Team 10 (The Gateway)  
**תאריך:** 2026-02-15  
**מקור מנדט:** [TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md](../team_90/TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md)

---

## 1. קונטקסט ותאום

### 1.1 סדר ביצוע (חובה)

| שלב | עמוד | תנאי |
|-----|------|------|
| **1** | **notes.html (D35 הערות)** | ראשון. חייב להגיע לסגירת Gate-KP לפני התחלת Alerts. |
| **2** | **alerts.html (D34 התראות)** | שני. אין משלוח/ביצוע Alerts במקביל לפני ש-Notes במצב סגירת שער. |

### 1.2 שרשרת שערים (לכל עמוד)

| שער | בעלים | תנאי יציאה |
|-----|--------|------------|
| **Gate-0** | 10 + 31 | סקופ/SSOT נעולים; תוצרי Scope lock (קובץ ייעודי); עדכון Page Tracker/SSOT |
| **Build** | 31 → 30/40 | Blueprint/ממשק לפי SSOT; מסירה ל-30/40 |
| **Gate-A** | 50 | דוח QA PASS; **Seal (SOP-013)** חובה |
| **Gate-B** | 90 | אימות Spy; **Seal (SOP-013)** חובה; הודעת 90 ל-10 |
| **Gate-KP** | 10 | קידום ידע, ארכיון, ניקוי; Consolidation |

**מקור החלטות אדריכלית:** `_COMMUNICATION/_Architects_Decisions/` (לא תיבת התקשורת כ-SSOT).

### 1.3 D35 Notes — משימת-על (Rich Text + Attachments)

עמוד Notes כפוף ל-**D35_RICH_TEXT_ATTACHMENTS_LOCK**: Rich Text ב-content (סניטיזציה שרת), עד 3 קבצים/הערה, 1MB/קובץ, MIME magic-bytes. תתי-משימות: DB (60), API (20), UI (30), QA (50), KP (10). SSOT: DDL, OpenAPI addendum, RICH_TEXT_SANITIZATION_POLICY — ראה Work Plan §5.

### 1.4 קישורים לאפיון ותוכנית

| מסמך | תיאור |
|------|--------|
| **[TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md](TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md)** | תוכנית עבודה מלאה — שערים, פירוט לפי שלב, D35 Lock, Critical path |
| **[TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md](../team_90/TEAM_90_TO_TEAM_10_MINI_BATCH_NOTES_ALERTS_MANDATE.md)** | מנדט Team 90 — סדר Notes→Alerts, דרישות הגשה |
| **TEAM_10_MASTER_TASK_LIST.md** | רשימת משימות — MB3A_NOTES_ALERTS, D35_RICH_TEXT_ATTACHMENTS_LOCK, MB3A-NOTES, MB3A-ALERTS |
| **מנדטי D35 (לפי צוות):** | [TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md](TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md), [30](TEAM_10_TO_TEAM_30_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md), [50](TEAM_10_TO_TEAM_50_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md), [60](TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md) |
| **Scope lock (תוצרי Gate-0):** | Notes: `TEAM_10_MB3A_NOTES_SCOPE_LOCK.md`; Alerts: `TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md` (ליצירה ב-Gate-0) |
| **TT2_PAGES_SSOT_MASTER_LIST.md** | documentation/01-ARCHITECTURE — עדכון מיפוי עמודים ב-Gate-0 |

---

## 2. פרומטים לפי סדר ביצוע

---

### שלב 1 — Notes (notes.html, D35)

#### 2.1.1 Gate-0 Notes — Team 10 + Team 31

**תנאי:** מנדט מאושר. **תוצר:** קובץ Scope lock ל-Notes; עדכון TT2_PAGES_SSOT + Page Tracker.

**פרומט → Team 31:**

```
Team 10 → Team 31 | MB3A Gate-0 Notes — נעילת סקופ/SSOT (D35)

אתם מופעלים ל-Gate-0 Notes (MB3A). סדר ביצוע: Notes ראשון, Alerts רק אחרי סגירת Notes.

משימה: נעילת סקופ ו-SSOT ל-D35 (עמוד הערות). תיאום עם Team 10 ליצירת קובץ TEAM_10_MB3A_NOTES_SCOPE_LOCK.md ועדכון documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md + Page Tracker אם נדרש.

אפיון ותוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md. מקור החלטות: _COMMUNICATION/_Architects_Decisions/. סגירה: רק עם Seal (SOP-013).
```

**פרומט → Team 10 (משימה פנימית):** השלמת TEAM_10_MB3A_NOTES_SCOPE_LOCK.md (יחד עם 31); עדכון Index/Page Tracker לפי נוהל.

---

#### 2.1.2 D35 Lock — Team 60, Team 20 (במקביל או אחרי Gate-0)

**תנאי:** Gate-0 Notes סגור (או בתיאום עם 10). **תוצר:** DDL רץ; API GET/PATCH notes + attachments; ולידציות.

**פרומט → Team 60:**

```
Team 10 → Team 60 | MB3A — D35 Notes (attachments + אחסון)

אתם מופעלים לחלק התשתית של D35 (Notes). סדר: Notes ראשון; Alerts אחרי סגירת Notes.

משימה: Migration טבלת user_data.note_attachments (documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql); נתיב אחסון בפועל, הרשאות כתיבה, מדיניות ניקוי. תיאום עם Team 20 על מבנה הטבלה.

מנדט מפורט + AC: TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md. תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §5. סגירה: רק עם Seal (SOP-013).
```

**פרומט → Team 20:**

```
Team 10 → Team 20 | MB3A — D35 Notes (API + Rich Text + attachments)

אתם מופעלים לחלק ה-API של D35 (Notes). סדר: Notes ראשון; Alerts אחרי סגירת Notes.

משימה: מודל/שירות/ראוטים ל-notes ו-note_attachments; ולידציות MIME (magic-bytes), גודל (1MB), מכסה (3); סניטיזציה ל-notes.content. חוזי שגיאה 413/415/422/403/404 לפי OpenAPI addendum. תיאום עם 60 על DDL.

מנדט מפורט + AC: TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md. תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §5. סגירה: רק עם Seal (SOP-013).
```

---

#### 2.1.3 Build Notes — Team 31 → Team 30 / Team 40

**תנאי:** Gate-0 Notes סגור. **תוצר:** Blueprint/ממשק Notes; מסירה ל-30/40.

**פרומט → Team 31:**

```
Team 10 → Team 31 | MB3A Build Notes — Blueprint/ממשק D35

Gate-0 Notes סגור. אתם מופעלים ל-Build Notes.

משימה: Blueprint/ממשק ל-notes.html (D35) לפי SSOT ו-TEAM_10_MB3A_NOTES_SCOPE_LOCK.md; מסירה ל-Team 30/40 לאינטגרציה. D35 Lock (Rich Text, attachments) — תאום עם 20/30 לפי צורך.

תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §3. סגירה: רק עם Seal (SOP-013).
```

**פרומט → Team 30:**

```
Team 10 → Team 30 | MB3A Build Notes — UI אינטגרציה D35

אתם מופעלים לאינטגרציה UI של עמוד הערות (Notes). תלות: תוצרי Team 31 (Blueprint) ו-Backend (20) ל-notes/attachments.

משימה: עורך Rich Text ב-Notes, העלאת קבצים, חסימות UI (סוג/גודל/מכסה 3). תאום עם 31 ו-20. מנדט D35: TEAM_10_TO_TEAM_30_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md.

תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §3, §5. סגירה: רק עם Seal (SOP-013).
```

**פרומט → Team 40:**

```
Team 10 → Team 40 | MB3A Build Notes — UI Assets/סטיילינג D35 (אם בסקופ)

אתם מופעלים לחלק UI/סטיילינג של עמוד הערות (Notes) לפי סקופ Gate-0 ותוצרי 31. תלות: Blueprint מ-31; תאום עם 30.

משימה: לפי TEAM_10_MB3A_NOTES_SCOPE_LOCK.md ו-SLA עם 30. תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md. סגירה: רק עם Seal (SOP-013).
```

---

#### 2.1.4 Gate-A Notes — Team 50

**תנאי:** Build Notes מוכן. **תוצר:** דוח QA; Seal (SOP-013).

**פרומט → Team 50:**

```
Team 10 → Team 50 | MB3A Gate-A Notes — QA validation D35

Build Notes מוכן. אתם מופעלים ל-Gate-A (QA) לעמוד הערות.

משימה: תרחישי E2E ו-API מלאים — Rich Text, קבצים מצורפים, XSS, חריגת גודל/מכסה/סוג. דוח TEAM_50_TO_TEAM_10_*_NOTES_QA_REPORT. סגירת שער — רק עם Seal (SOP-013).

מנדט D35: TEAM_10_TO_TEAM_50_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md. תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §3. אין Gate-B לפני Gate-A PASS.
```

---

#### 2.1.5 Gate-B Notes — Team 90

**תנאי:** Gate-A Notes PASS. **תוצר:** אימות Spy; הודעת 90 ל-10; Seal (SOP-013).

**פרומט → Team 90 (בקשה משער):**

```
Team 10 → Team 90 | MB3A Gate-B Notes — בקשת אימות Spy (D35)

Gate-A Notes PASS (דוח QA + Seal התקבלו). מבקשים אימות Gate-B (Spy) לעמוד הערות (notes.html, D35).

תוצרים: TEAM_10_MB3A_NOTES_SCOPE_LOCK.md; Build (31→30/40); דוח Gate-A; Evidence D35 לפי מנדטים. סגירה — רק עם Seal (SOP-013). לאחר Gate-B PASS — Team 10 ממשיך ל-Gate-KP Notes.
```

---

#### 2.1.6 Gate-KP Notes — Team 10

**תנאי:** Gate-B Notes PASS. **תוצר:** קידום ידע, ארכיון תקשורת, ניקוי; Consolidation; ARCHIVE_MANIFEST. **אחרי סגירת Gate-KP Notes — מותר להתחיל Alerts.**

---

### שלב 2 — Alerts (alerts.html, D34)

*מותר להתחיל רק אחרי ש-Notes הגיע ל-Gate-KP (סגור).*

#### 2.2.1 Gate-0 Alerts — Team 10 + Team 31

**תנאי:** Notes הגיע ל-Gate-KP (סגור). **תוצר:** TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md; עדכון SSOT + Page Tracker.

**פרומט → Team 31:**

```
Team 10 → Team 31 | MB3A Gate-0 Alerts — נעילת סקופ/SSOT (D34)

Notes סגור (Gate-KP). אתם מופעלים ל-Gate-0 Alerts (MB3A).

משימה: נעילת סקופ ו-SSOT ל-D34 (עמוד התראות). תיאום עם Team 10 ליצירת TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md ועדכון TT2_PAGES_SSOT_MASTER_LIST + Page Tracker.

תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §4. סגירה: רק עם Seal (SOP-013).
```

---

#### 2.2.2 Build Alerts — Team 31 → Team 30 / Team 40

**פרומט → Team 31:**

```
Team 10 → Team 31 | MB3A Build Alerts — Blueprint/ממשק D34

Gate-0 Alerts סגור. אתם מופעלים ל-Build Alerts. משימה: Blueprint/ממשק ל-alerts.html (D34); מסירה ל-30/40. תוכנית: TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md §4.
```

**פרומט → Team 30 / 40:** (בהתאם לסקופ — דומה ל-Notes, עמוד התראות.)

---

#### 2.2.3 Gate-A Alerts — Team 50

**פרומט → Team 50:** דוח QA ל-Alerts; Seal (SOP-013). תוכנית §4.

#### 2.2.4 Gate-B Alerts — Team 90

**פרומט → Team 90:** בקשת אימות Spy ל-Alerts לאחר Gate-A PASS.

#### 2.2.5 Gate-KP Alerts — Team 10

קידום ידע, ארכיון, ניקוי. סגירת MB3A.

---

## 3. סיכום סדר ביצוע

```
Notes:  [Gate-0 (10+31)] → [D35: 60,20] → [Build (31→30/40)] → [Gate-A (50)] → [Gate-B (90)] → [Gate-KP (10)]
                                                                                                      ↓
Alerts: (המתנה ל-Gate-KP Notes) → [Gate-0 (10+31)] → [Build (31→30/40)] → [Gate-A (50)] → [Gate-B (90)] → [Gate-KP (10)]
```

---

**log_entry | TEAM_10 | MB3A | CONTEXT_AND_ACTIVATION_PROMPTS_ISSUED | 2026-02-15**
