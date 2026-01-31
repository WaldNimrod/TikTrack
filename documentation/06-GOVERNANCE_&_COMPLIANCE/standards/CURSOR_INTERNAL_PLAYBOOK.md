# ⚔️ ספר הנהלים לקבלן המבצע - Cursor Playbook (v2.5)

**מיקום:** `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/`  
**אחריות ואכיפה:** צוות 10 (The Gateway)

---

## 1. ארגון קבצים (Hygiene)

* **תקשורת ותכנון:** `/documentation/05-REPORTS/artifacts_SESSION_XX/`
* **תקשורת פנימית:** `/_COMMUNICATION/team_[ID]/`
* **תיעוד קבוע:** `/documentation/[00-07]/` + עדכון D15.

---

## 2. פרוטוקול "אני מוכן" (Readiness Protocol)

צוות נחשב ל"פעיל" רק לאחר הצהרת מוכנות בצ'אט בפורמט הבא:

```text
From: Team [X]
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Squad context.
Context Check: [ציין מסמך מדרייב שעליו אתה מתבסס]
Next: I am ready for the first task.
log_entry | [Team X] | READY | 001 | GREEN
```

---

## 3. הגדרות תפקיד וציפיות (Detailed Roles)

* **צוות 10 (The Gateway):** מפקד השטח. ניהול ה-D15, סנכרון GitHub/Drive, וסינון שאלות לאדריכלים.

* **צוות 20 (Backend):** מימוש FastAPI בהתאמה ל-LOD 400 SQL.

* **צוות 30 (Frontend):** מימוש Pixel Perfect מול Design Tokens בלבד.

* **צוות 40 (UI Assets & Design):** ניהול Design Tokens, CSS Layers (Base/Comp/Header).

* **צוות 50 (QA & Fidelity):** 
  - ולידציה של Evidence בתיקייה `05-REPORTS/artifacts/`
  - בדיקות Integration Testing (Backend + Frontend)
  - בדיקות Code Review (Compliance עם סטנדרטים)
  - בדיקות Selenium אוטומטיות (Runtime Testing)
  - לידציה ויזואלית סופית (Visual Validation)
  - **נוהל עבודה:** `TEAM_50_QA_WORKFLOW_PROTOCOL.md`
  - **סטנדרטים מחייבים:** 
    - CSS: `TT2_CSS_STANDARDS_PROTOCOL.md` (`documentation/07-POLICIES/`)
    - JS: `TT2_JS_STANDARDS_PROTOCOL.md` (`documentation/07-POLICIES/`)

* **צוות 60 (DevOps & Platform):** תשתיות ייצור (Build), סביבות פיתוח ו-Deployment.

---

## 4. תקשורת פנימית ודיווח (Internal Flow)

1. **דיווח EOD:** כל צוות שולח לצוות 10 סיכום ביצוע יומי.
2. **שער המידע:** שום שאלה לא עוברת לאדריכלים ללא בדיקה של צוות 10 מול ה-D15.

---

## 5. ארגון קבצים ותיקיות (File Organization Protocol) 🚨 חובה

[תוכן נוסף לפי הצורך]

---

**Last Updated:** 2026-01-31  
**Version:** 2.5  
**Maintained By:** Team 10 (The Gateway)
