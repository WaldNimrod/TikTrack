---
id: ADR-010
owner: Architect
status: SSOT - ACTIVE
supersedes: [ADR-008, ADR-009]
last_updated: 2026-02-09
version: v1.0
source: _COMMUNICATION/team_10/ARCHITECT_PHASE_2_UNIFIED_CLOSURE_MANDATE.md
---

# 🏰 מנדט אדריכל מאוחד: פקודת סגירת פייז 2 (Final Step 1)

**תאריך:** 2026-02-09 | **סטטוס:** 🔒 FINAL SEAL

## 📐 1. חוב רספונסיביות (Option D - Sticky Isolation)
**סקופ:** **כל הממשק בכל העמודים** — הממשק כולו חייב להיות רספונסיבי ואחיד. הטבלאות הן החלק המורכב והחשוב ביותר, אך הדרישה חלה על כל העמודים והרכיבים.
* **טבלאות (D16, D18, D21, D23):** Sticky Start/End (עמודות מזהה ופעולות מקובעות ב-CSS); Fluid Weights עם clamp() לרוחב עמודות; איסור על display:none.
* **שאר הממשק:** רספונסיביות ואחידות ויזואלית בכל העמודים (layout, טיפוגרפיה, ריווח) בהתאם לאותם עקרונות.

## 💾 2. חוב ניהול נתונים (SOP-011 - Seeding)
* **Infrastructure:** בניית Python Seeders מבוססי Models (צוות 20/60).
* **The Flag:** חובת סימון is_test_data = true לכל נתוני הדמה.
* **Wipe Control:** פקודת make db-test-clean חייבת להשאיר DB סטרילי.

## 👥 3. משילות ארגונית (SLA 30/40 & Gates)
* **SLA 30/40:** צוות 40 (UI - Presentational) | צוות 30 (Logic - Container).
* **Quality Gates:** 1. Gate A (50) | 2. Gate B (90) | 3. Gate C (G-Lead).

## 🧠 4. הקשחת לוגיקה ואבטחה
* **Transformers:** המרה כפויה ל-Number בשדות כספיים.
* **Masked Log:** שימוש בלעדי ב-audit.maskedLog.
* **Port Lock:** נעילה הרמטית: FE: 8080 | BE: 8082.
* **UAI Enrollment:** עמודי פייז 2 נטענים אך ורק דרך UnifiedAppInit.js.

## ⚖️ 5. פסיקת Endpoints
* **החלטה:** Option A (Full Backend Implementation) עבור Summary ו-Conversions.

---
**log_entry | [Architect] | ADR-010 | SSOT_PROMOTED | 2026-02-09**
