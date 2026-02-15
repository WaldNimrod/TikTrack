# Team 10 → Team 60: הודעה — Precision Policy SSOT פורסם

**id:** `TEAM_10_TO_TEAM_60_PRECISION_POLICY_PUBLISHED`  
**from:** Team 10 (The Gateway)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**סוג:** הודעה רשמית — תנאי מקדים ל־P3-006 הושלם

---

## הודעה

**מסמך Precision Policy SSOT פורסם.** חובה ליישר DB/Schema לפי המסמך.

**נתיב SSOT:** `documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md`

---

## פעולה נדרשת מכם

1. **יישור DB/Schema** — כל עמודות NUMERIC בהתאם למפה במסמך.
2. **brokers_fees.minimum** — במסמך: NUMERIC(20,6). אם כיום ב־DB 20,8 — נדרשת מיגרציה ל־20,6.
3. **Evidence** — דוח `TEAM_60_P3_006_PRECISION_EVIDENCE.md` (או דומה) ב־`_COMMUNICATION/team_60/` לאחר היישור.

עיקרי המפה: מחירים/שערים/כמויות → 20,8; יתרות/סכומים/תזרימים/P/L/עמלות → 20,6. פרטים מלאים במסמך.

---

**log_entry | TEAM_10 | TO_TEAM_60 | PRECISION_POLICY_PUBLISHED | 2026-02-13**
