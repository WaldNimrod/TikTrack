---
id: TEAM_00_TO_TEAM_170_AOS_V3_RENUMBERING_AND_CANON_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 170 (Spec & Governance)
date: 2026-03-26
status: ACTIVE
type: MANDATE
priority: HIGH — execute before Stage 2 is published to broad agent use
subject: (1) Team ID renumbering 101→110 / 102→111 across all documentation; (2) Canon principles update; (3) D-03 formalization---

# MANDATE — AOS v3 Renumbering + Canon Principles

---

## 1. הקשר ורציונל

**החלטה נעולה (Team 00 + hub §9):**

| ישן | חדש | שם | רציונל |
|---|---|---|---|
| `team_101` | `team_110` | AOS Domain Architect (IDE) | 100 = Chief Architect — collision מניעת |
| `team_102` | `team_111` | TikTrack Domain Architect (IDE) | x0/x1 pattern — 110/111 = architect pair |

**TEAMS_ROSTER_v1.0.0.json עודכן לv1.5.0 ע"י Team 00.**
Team 170 אחראי על עדכון שאר המסמכים.

**D-03 (hub §2, נעול):** שורת `team_00` ב-DB (טבלת `teams`) = ייצוג DB של human operator לצורך FK integrity (assigned_by, Event.actor_id וכו'). לא "עוד agent".

---

## 2. קבצים לעדכון — SCOPE

### 2א. תוכן מהותי — חובה לעדכן
| קובץ | מה לעדכן |
|---|---|
| `documentation/docs-governance/01-FOUNDATIONS/TEAM_TAXONOMY_v1.0.0.md` | כל מופע של team_101/102 → team_110/111 |
| `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` | team IDs + §4.1 reporting line (ראה §3 מטה) |
| `documentation/docs-governance/01-FOUNDATIONS/PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` | הוסף D-03: team_00 DB row semantics |
| `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEAM_ROSTER_v3.0.0.md` | team IDs |
| `_COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md` | team IDs אם מופיעים |
| `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0.md` | team IDs |
| `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md` | team IDs |
| `documentation/docs-system/02-PIPELINE/AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.0.md` | team IDs |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | team IDs אם מופיעים |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | team IDs אם מופיעים |

### 2ב. קבצי team_110 (לשעבר team_101) — עדכון header בלבד
הקבצים ב-`_COMMUNICATION/team_101/` עצמם: **אין לשנות את תוכן המסמכים** — הם תיעוד היסטורי. רק:
1. עדכן `TEAM_101_IDENTITY_v1.0.0.md` → הוסף שורה: `"renumbered to team_110 on 2026-03-26"`
2. שמור את התיקייה כ-`_COMMUNICATION/team_101/` (לא לשנות שמות תיקיות)

### 2ג. notification files ב-team_100 — לא לשנות
קבצים כמו `TEAM_101_TO_TEAM_100_*.md` — **אל תשנה אותם**. הם תיעוד היסטורי של מה שנשלח ע"י team_101.

---

## 3. Canon Principles — §4.1 מה-Hub (להוסיף ל-TEAM_DEVELOPMENT_ROLE_MAPPING)

הוסף סעיף חדש ב-`TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` (או צור v1.0.2):

```markdown
## Reporting Line — AOS v3 Domain Architects (canonical)

**Team 110** (AOS Domain Architect, formerly team_101) delivers AOS v3 spec artifacts
to **Team 100** (Chief Architect) under Principal-authorized program.
**Team 00** (Principal/Nimrod) = escalations + Iron Rules + gate approval.

**Team 111** (TikTrack Domain Architect) operates under the same model for TikTrack domain.

Authority chain: Team 00 → Team 100 → Team 110/111
Spec delivery: Team 110/111 → Team 100 (for synthesis/merge)
Gate approval: Team 00 only
```

---

## 4. D-03 — team_00 DB Row (להוסיף ל-PRINCIPAL_AND_TEAM_00_MODEL)

הוסף לסעיף מתאים ב-`PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md`:

```markdown
## team_00 בבסיס הנתונים (D-03)

**ישות DB:** שורה בטבלת `teams` עם `id='team_00'` קיימת ב-AOS v3 DB.
**מטרה:** FK integrity בלבד — שדות כגון `Assignment.assigned_by`, `Event.actor_id`
          (כאשר actor_type='human') יכולים להצביע ל-team_00.
**חשוב:** זה ייצוג DB של human operator — לא agent נוסף, לא team בפייפליין.
**Iron Rule:** אין לנתב pipeline tasks ל-team_00 ב-routing_rules.
```

---

## 5. Iron Rules לביצוע

1. **שינוי ID בלבד** — לא לשנות תוכן, היגיון, או החלטות קיימות
2. **atomic where possible** — עדיף commit אחד לכל קבוצת קבצים קשורים
3. **לא לשנות** notification files היסטוריים (TEAM_101_TO_TEAM_100_*.md וכו')
4. **לא לארכב** תיקיית _COMMUNICATION/team_101/ — נשארת במקומה

---

## 6. פלט נדרש

קובץ completion report ב-`_COMMUNICATION/team_170/`:
```
TEAM_170_AOS_V3_RENUMBERING_COMPLETE_v1.0.0.md
```
כלול: רשימת קבצים שעודכנו + git commit hashes.

---

**log_entry | TEAM_00 | RENUMBERING_AND_CANON_MANDATE | ISSUED | 2026-03-26**
