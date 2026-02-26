# PHOENIX — מדריך קנוני להצגת הודעות בין צוותים (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE  
**purpose:** Single front — מתי מסמך קנוני (קובץ) ומתי פרומט להעתקה (בלוק)  
**date:** 2026-02-26  
**status:** ACTIVE  
**supersedes_ambiguity:** כפילות בין "פורמט הודעה" (Team 190) ל"הודעות להעברה" (Team 10 G3.6)

---

## Mandatory Identity Header (this guide)

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 10 (Gateway) — maintained with Team 190 (format authority) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Purpose

לאחד את המידע כך שכל הצוותים יבינו:
- **איזה פורמט** חל — מסמך (קובץ) או פרומט להעתקה (בלוק).
- **איך להציג** הודעות המיועדות להעברה בין צוותים — ללא כפילות או סתירה.

---

## 2) שני ערוצים (ללא כפילות)

| ערוץ | מתי משתמשים | איך להציג | מקור קנוני |
|------|--------------|-----------|------------|
| **מסמך קנוני (קובץ)** | בקשת ולידציה, תגובת ולידציה, דירקטיבה, הודעת adoption, כל ארטיפקט שמוגש כשער/תהליך | **קובץ** עם כותרת, מטא-דאטה, טבלת Identity Header, סעיפים 1–6, שורת log_entry | TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md |
| **פרומט להעתקה (בלוק)** | מנדט הפעלה לצוות (למשל G3.6), הוראות להדבקה במשימה — **בלי ליצור קובץ חדש** | **כותרת "הודעה לצוות X"** ואז **בלוק קוד** עם התוכן להעתקה; לא נוצרים קבצים | TEAM_10_S002_P001_WP001_G36_CANONICAL_TEAM_PROMPTS.md (דוגמה) |

---

## 3) מסמך קנוני (קובץ) — פורמט חובה

כשההודעה היא **ארטיפקט** (קובץ) — בקשת GATE, תגובה, דירקטיבה, adoption:

1. **מבנה:** כותרת (`# ...`), מטא-דאטה (project_domain, id, from, to, cc, date, status, gate_id וכו'), טבלת **Mandatory Identity Header**, סעיפים **1–6** (Purpose, Context/Inputs, Required actions, Deliverables, Validation criteria, Response required), שורת **log_entry**.
2. **מקור מלא:** `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md` — תבנית העתקה, שדות חובה, כללי אכיפה.

הודעות לא בפורמט הזה = לא תקפות למעבר שער.

---

## 4) פרומט להעתקה (בלוק) — כשההודעה אינה קובץ

כשמעבירים **מנדט/הוראות** להדבקה במשימה (למשל הפעלת צוות 20/70 ב־G3.6):

1. **אין יוצרים קובץ חדש** להודעה — התוכן מוצג במסמך קיים (למשל Runbook או קובץ פרומטים).
2. **איך להציג:** כותרת ברורה **"הודעה לצוות X"** (או "פרומט לצוות X"), ואז **בלוק קוד** (```) שמכיל את הטקסט להעתקה.
3. **תוכן הבלוק:** יכול לכלול חיזוק משילות, רפרנסים, הוראות מדויקות — **בלי** חובת §1–§6 מלא (כי זה לא ארטיפקט שער אלא פרומט להדבקה).

דוגמה: `_COMMUNICATION/team_10/TEAM_10_S002_P001_WP001_G36_CANONICAL_TEAM_PROMPTS.md` — הודעות לצוות 20 ו־70 בתוך בלוקים.

---

## 5) סיכום — איזה פורמט מתי

- **שולחים/יוצרים קובץ** (בקשה ל־Team 190, תגובה ל־Team 170, דירקטיבה, adoption וכו') → **מסמך קנוני** לפי TEAM_190 lock (סעיפים 1–6, Identity Header, log_entry).
- **מעבירים מנדט/פרומט להדבקה** (הפעלת צוות, הוראות במשימה, בלי קובץ חדש) → **"הודעה לצוות X" + בלוק קוד**; אין כפילות עם פורמט המסמך — זה ערוץ אחר.

---

## 6) רפרנסים

| מסמך | תפקיד |
|------|--------|
| `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.md` | פורמט חובה למסמכי הודעה (קבצים) — מטא-דאטה, Identity Header, §1–§6, log_entry. |
| `_COMMUNICATION/team_10/TEAM_10_S002_P001_WP001_G36_CANONICAL_TEAM_PROMPTS.md` | דוגמה לפרומטים להעתקה (בלוקים) — הודעות לצוות 20/70 ב־G3.6. |
| `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md` | Runbook — מפנה לפורמט קנוני לארטיפקטים; G3.6 מנדטים ממומשים כפרומטים (בלוקים). |

---

**log_entry | TEAM_10 | PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE | v1.0.0 | 2026-02-26**
