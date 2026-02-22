**Canonical location (SSOT):** This file is superseded by the canonical copy. Canonical: `documentation/docs-governance/AGENTS_OS_GOVERNANCE/07-DIRECTIVES_AND_DECISIONS/BATCH_2_5_COMPLETIONS_MANDATE.md`

---
id: ADR-017
owner: Architect
status: LOCKED - G-LEAD APPROVED
SV: 1.0.0
---
**project_domain:** TIKTRACK

# 🏰 מנדט אדריכל: השלמות בץ 2.5 וביצור שער האוטנטיקציה

מסמך זה מאחד את כלל תיקוני "שלב הנבט" ונועל את מודל הגישה.

## 🔐 1. מודל האוטנטיקציה המרובע (A/B/C/D)
- **A) Open:** Login, Register, Reset-Password. (Header מוסתר).
- **B) Shared:** Home (/). מציג Container שונה לאורח/מחובר.
- **C) Auth-only:** כל שאר העמודים. אורח מופנה ל-Home (/).
- **D) Admin-only:** עמודי ניהול. בדיקת JWT Role. לא-מורשה מופנה ל-Home.

## 📐 2. רספונסיביות ו-Fidelity (Option D)
- **עמודות Sticky:** מזהה/שם ב-Start, פעולות ב-End.
- **נוסחת clamp:** מזהה: `clamp(140px, 18vw, 400px)` | נתונים: `clamp(90px, 12vw, 180px)`.
- **Header Fix:** תיקון רגרסיה - ה-Header חייב להופיע תמיד במעבר Login -> Home.

## 🛡️ 3. היגיינת קוד וגרסאות
- **Versioning:** יישור קו גורף לגרסה 1.0.0 בכל הקבצים (Package.json, API, DDL).
- **No-Logs:** שימוש בלעדי ב-`audit.maskedLog`. הסרה מוחלטת של console.log.

**log_entry | [Architect] | CUMULATIVE_SETTLEMENT | GREEN | 13.2.2026, 11:13:08**