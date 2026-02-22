# 🔒 Page Layout & Sections — SSOT (תבנית עמוד, סיכום מידע, Expand/Collapse)
**project_domain:** TIKTRACK

**id:** `PAGE_LAYOUT_AND_SECTIONS_SSOT`  
**owner:** Team 10 (The Gateway) — מקודם מיישום Team 30  
**status:** ✅ **SSOT - ACTIVE**  
**last_updated:** 2026-02-12  
**מקור:** TEAM_30_TO_TEAM_10_PAGE_LAYOUT_INFO_SUMMARY_IMPLEMENTATION_REPORT.md

---

## 1. יישור עמוד (Page Alignment)

| נושא | סטנדרט | קובץ |
|------|--------|------|
| **תוכן כשכל הסקציות סגורות** | תוכן נשאר **צמוד לחלק העליון** (לא ממורכז לאמצע) | `ui/src/styles/phoenix-base.css` |
| **כלל CSS** | `body .page-wrapper .page-container main` — `justify-content: flex-start` (הוחלף מ-`center`) | ~שורה 542 |

---

## 2. Info Summary — מבנה חובה

| שורה | סטנדרט | יישום |
|------|--------|--------|
| **שורה ראשונה** | תוכן בתוך `<div class="info-summary__content">` + כפתור toggle בסוף | phoenix-components.css, HTML |
| **שורה שנייה** (אם קיימת) | תוכן בתוך `<div class="info-summary__content">` — **אותו gap ו-flex** כראשונה | `.info-summary__row--second` — `gap: var(--spacing-lg)`; `.info-summary__row--second .info-summary__content` — flex, justify-content center, gap זהה |

**קבצים:** `ui/src/styles/phoenix-components.css`, עמודי HTML/React (trading_accounts.html, cash_flows.html, brokers_fees.html, HomePage.jsx).

---

## 3. Expand/Collapse All

| תנאי | יישום |
|------|--------|
| **עמוד עם יותר מ-3** אלמנטים `tt-section` בתוך `tt-container` | כפתור **Expand/Collapse All** בסקציה **הראשונה** |
| **סוג כפתור** | `js-expand-collapse-all` (מחליף `js-section-toggle` בסקציה הראשונה) |
| **אייקון** | שני פסים אופקיים + שני חצים (למעלה/למטה) |
| **נגישות** | `aria-label: "הצג/הסתר את כל האזורים"` |
| **לוגיקה** | `ui/src/components/core/sectionToggleHandler.js` — `toggleAllSections`, `initExpandCollapseAll` |

**עמודים שבהם מיושם:** `trading_accounts.html` (5 סקציות). עמודים עם ≤3 סקציות — ללא כפתור זה.

---

## 4. Checklist לעמודים חדשים

- [ ] **Info summary:** שתי שורות (אם רלוונטי) עם `info-summary__content` באותו עיצוב.
- [ ] **יישור:** `main` עם `justify-content: flex-start` (ב-base).
- [ ] **אם >3 tt-section:** כפתור expand-collapse-all בסקציה הראשונה.

---

## 5. רפרנסים

| קובץ | תפקיד |
|------|--------|
| `ui/src/styles/phoenix-base.css` | justify-content: flex-start ל-main |
| `ui/src/styles/phoenix-components.css` | info-summary__row, info-summary__content, info-summary__row--second |
| `ui/src/components/core/sectionToggleHandler.js` | toggle יחיד + expand-collapse-all |
| `documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md` | סעיף 7 — סיכום וקישור למסמך זה |

---

**log_entry | TEAM_10 | PAGE_LAYOUT_AND_SECTIONS_SSOT | PROMOTED | 2026-02-12**
