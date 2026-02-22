# Team 10 — החלטות רשמיות לסגירת פערים (GAP_CLOSURE_BEFORE_AGENT_POC)
**project_domain:** TIKTRACK

**id:** TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS  
**owner:** Team 10 (The Gateway)  
**stage:** GAP_CLOSURE_BEFORE_AGENT_POC  
**date:** 2026-02-18  
**מטרה:** נעילת החלטות כדי לאפשר Gate חוזר של Team 90 (STATUS: CLEAN_FOR_AGENT).

---

## 1. SOP-013 (נוהל סגירה / חסם Seal)

**החלטה:** קנון יחיד — `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`. אין קובץ policy נפרד בנתיב פעיל; קובץ 07-POLICIES הועבר לארכיון.

**יישום:** המסמך הקנוני עודכן להפנות לעצמו; כל ההפניות הפעילות (Evidence logs, Team 90 indexes) עודכנו לנתיב הקנוני.

---

## 2. Master Index (נתיב קנוני)

**החלטה:** **קנון יחיד:** `00_MASTER_INDEX.md` (שורש הפרויקט). כל הפניה ל־"מאסטר אינדקס" או ל־אינדקס גלובלי תפנה לנתיב זה.

**יישום:** PHOENIX_DOCUMENTATION_GOVERNANCE_INDEX עודכן; 00_MASTER_INDEX.md בשורש הוא ה־entry point המחייב.

---

## 3. עמימויות סמכות (Smart History Fill / Header / P3_003)

| נושא | החלטה |
|------|--------|
| **Smart History Fill** | מקור אמת: `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` §5 + MARKET_DATA_COVERAGE_MATRIX Rule 9. `TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md` ב־90_Architects_comunication — **תקשורת בלבד**, לא SSOT. |
| **Header unification** | קנון: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_HEADER_UNIFICATION_MANDATE.md` (במידה שקיים). הפניות בפרוצדורות — לנתיב _Architects_Decisions בלבד. |
| **P3_003 SSOT alignment** | `TEAM_10_TO_ARCHITECT_P3_003_SSOT_ALIGNMENT_UPDATE.md` — **הקשר היסטורי בלבד**; לא מקור החלטה מחייב. החלטות P3-003 ב־MASTER_TASK_LIST ו־מטריצת Blueprint Scope. |

---

## 4. Authority Drift (AD-001 … AD-019)

**החלטה:** כל הפניה להחלטות אדריכלית / Roadmap / מדיניות סגירה — **רק** ל־`_COMMUNICATION/_Architects_Decisions/`. לא ל־`90_Architects_comunication` כסמכות.

**יישום:** תוקן בקבצים פעילים: ARCHITECT_DIRECTIVE (הפניה עצמית), Evidence logs (SOP-013), PHOENIX_DOCUMENTATION_GOVERNANCE_INDEX, TEAM_90_GOVERNANCE_ROLE_RESET. יתר תיקוני נתיבים (למשל 00_MASTER_INDEX בקבצי documentation אם קיימים) — לפי רישום Team 90; קבצים בארכיון לא משתנים.

---

## 5. Carryover (CARRY-001 … CARRY-015)

**החלטה:** כל 15 הפריטים מסומנים **FORMALLY DECIDED** — יטופלו בשלב/באץ' היעד המפורט ברשימת הפערים; **לא חוסם** את יציאת שלב GAP_CLOSURE_BEFORE_AGENT_POC או הפעלת POC Agent, בכפוף לכך שכל פריט מקושר ל־target stage ו־owner ב־GAP_CLOSURE_MASTER_LIST.

**פירוט:** CARRY-001..003 — Batch 3 readiness; CARRY-004..013 — Page Tracker / Batch 3–6; CARRY-014 — טריאז' לוגיקה (Team 10+20); CARRY-015 — החלטת דיוק (Team 10+20+60). סגירה מלאה של כל פריט — במסגרת הבאצ'ים הרלוונטיים עם Seal (SOP-013).

---

**log_entry | TEAM_10 | GAP_CLOSURE_FORMAL_DECISIONS | LOCKED | 2026-02-18**
