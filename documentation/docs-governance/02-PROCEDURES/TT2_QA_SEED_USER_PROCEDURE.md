# 👤 נוהל: Seed משתמש QA לבדיקות Gate B (Runtime/E2E)

**id:** `TT2_QA_SEED_USER_PROCEDURE`  
**owner:** Team 60 (DevOps & Platform) — תיעוד: Team 10 (Gateway)  
**status:** 🔒 **ACTIVE**  
**last_updated:** 2026-02-07  
**version:** v1.0

---

## 📋 מטרה

הבטחת משתמש QA **קבוע** במערכת אחרי כל איפוס/רענון DB — לצורך בדיקות Gate B (Runtime + E2E) ו-Login.

---

## 📌 מסמך מלא (SSOT)

**קריאת חובה:**  
[**scripts/README_SEED_QA_USER.md**](../../scripts/README_SEED_QA_USER.md)

המסמך המלא כולל: credentials, שימוש (Python vs SQL), אינטגרציה ל-reset/CI/Docker, אימות, התנהגות הסקריפט, והערות אבטחה.

---

## ⚡ סיכום מהיר

| פריט | ערך |
|------|-----|
| **Username** | `TikTrackAdmin` |
| **Password** | `4181` |
| **הרצה (מומלץ)** | `python3 scripts/seed_qa_test_user.py` |
| **אחרי** | איפוס DB / רענון schema |

---

## 🔗 קישורים בתיעוד הקבוע

- **אינדקס מאסטר:** `00_MASTER_INDEX.md` (root) — סעיפי נוהלי QA ותשתיות
- **Database Credentials:** `documentation/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md` — סעיף "QA Test User Seed"

---

**Team 10 (Gateway)**  
**שילוב בתעוד קבוע:** 2026-02-07
