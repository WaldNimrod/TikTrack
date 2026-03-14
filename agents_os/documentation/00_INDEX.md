# Agents_OS Documentation — Entry Point
## 00_INDEX (ספריית תיעוד דומיין Agents_OS)

**project_domain:** AGENTS_OS  
**id:** AGENTS_OS_DOCUMENTATION_00_INDEX  
**owner:** Team 170 (תיעוד); Team 100 (אדריכל)  
**date:** 2026-03-14  
**status:** Active — אופציה C ממומשת (מימוש מלא)

---

## 1. נקודת כניסה לדומיין

**מקור ראשי מאורגן:** [documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md](../../documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md) — אינדקס מלא, Quick Start, ארכיטקטורה, CLI.

ספריית התיעוד של דומיין Agents_OS: מפרטים, קונספטים, פרוטוקולים ותבניות. משילות משותפת (WSM, נהלים, תבניות משותפות) נמצאת ב־`documentation/docs-governance/`.

---

## 2. מבנה לוגי — תיקיות תיעוד (אופציה C)

| תיקייה | תוכן |
|--------|------|
| [01-FOUNDATIONS/](01-FOUNDATIONS/) | מסמכי יסוד: AGENTS_OS_FOUNDATION, חבילת קונספט (Cover, Domain Isolation, Architect Concept). |
| [02-SPECS/](02-SPECS/) | מפרטים: Concept Package (Impact, Roadmap, Risk), AOS Workpack, קרנטין. |
| [03-TEMPLATES/](03-TEMPLATES/) | קישורים לתבניות משותפות: LLD400, LOD200 ב־documentation/docs-governance/06-TEMPLATES/ |

---

## 3. תוכן ישיר תחת `agents_os/`

| מיקום | תוכן |
|--------|------|
| [agents_os/README.md](../README.md) | מבנה ריצה, validators, domain isolation, חיבור 10↔90. |
| [agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md](../AGENTS_OS_FOUNDATION_v1.0.0.md) | Foundation spec — ללא לוגיקת מוצר TikTrack. |
| [agents_os/docs-governance/](../docs-governance/) | חבילת קונספט, AOS workpack, קרנטין — ממופים ב־02-SPECS. |

---

## 4. משילות משותפת (מחוץ ל־agents_os/)

| מה | איפה |
|-----|------|
| נהל הפעלה V2, pipeline, צוותים, context | [documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md](../../documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md) |
| תבניות LOD200 / LLD400 | [documentation/docs-governance/06-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md](../../documentation/docs-governance/06-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md), [LLD400_TEMPLATE_v1.0.0.md](../../documentation/docs-governance/06-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md) |
| WSM, SSM, Gate Model, Team Role Mapping | [documentation/docs-governance/01-FOUNDATIONS/](../../documentation/docs-governance/01-FOUNDATIONS/) |

---

## 5. אינדקס ראשי (כל הדומיינים)

נקודת כניסה גלובלית: [00_MASTER_INDEX.md](../../00_MASTER_INDEX.md) (שורש repo) — פיצול TIKTRACK / AGENTS_OS / משותף.

---

**log_entry | TEAM_170 | AGENTS_OS_DOCUMENTATION_00_INDEX | DELIVERED | 2026-03-14**
