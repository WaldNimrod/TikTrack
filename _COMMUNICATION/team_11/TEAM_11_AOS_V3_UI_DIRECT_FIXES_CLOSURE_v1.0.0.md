---
id: TEAM_11_AOS_V3_UI_DIRECT_FIXES_CLOSURE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 10 (Gateway consolidation) · Team 51 (E2E when mandated) · Team 31/21 (implementation record)
date: 2026-03-29
type: GATEWAY_CLOSURE — non-WP direct remediation (UI layout + data + tests)
domain: agents_os
branch: aos-v3---

# סגירה — תיקוני AOS v3 UI ישירים (ללא חבילת WP קאנונית)

## הקשר

סדרת שינויים ישירים ליישור ממשק v3 עם דרישות מוצר (היסטוריה/פורטפוליו/קונפיג/צוותים, דומיין, מיון, seed צוותים מלא). **לא** נפתחה כאן חבילת עבודה חדשה בפיפליין; מסמך זה **נועד לנעיל וניקוי** לפני המשך לפי נוהל ופיפליין לחבילות הבאות.

## מה נסגר ב-repo (תמצית)

| אזור | תוכן |
|------|------|
| History | Run overview בסיידבר, רוחב צר ב-CSS |
| Config | ללא בורר דומיין בעמוד; ניווט: Configuration לפני System Map |
| Portfolio | Gate filter בסיידבר; עמודות דומיין/WP/תוכנית; מיון טבלאות |
| Teams | `definition.yaml` כל `team_*`, `seed.py` לולאה מלאה, `_def_team_meta()` + joins |
| API reads | `domain_slug`, WP hints על runs; תיקון `r.status` ב-WHERE אחרי JOIN |
| בדיקות | `test_http_root_serves_v3_index_at_slash` מקבל `base href="./"` או `/v3/` (יישור עם HTML קיים) |

## אימות מומלץ לפני push

```bash
bash scripts/check_aos_v3_build_governance.sh
python3 -m pytest agents_os_v3/tests/ -q --ignore=agents_os_v3/tests/e2e -k "not OpenAI and not Gemini"
# E2E מלא בדפדפן (כשמופעל):
# AOS_V3_E2E_RUN=1 pytest agents_os_v3/tests/e2e/
```

## ארטיפקטים

- `agents_os_v3/FILE_INDEX.json` — גרסה ותאריך עודכנו עם השינויים תחת `agents_os_v3/`.
- קנוני תיעוד Agents OS: **לא** מקודם כאן; נתיב קידום לפי `.cursorrules` דרך **Team 170** (מנדט רשמי להלן).

## מנדטים לסגירת זנבות (חובה לפני חבילה חדשה)

| יעד | מסמך |
|-----|------|
| **Team 51** — בדיקות סופיות (pytest + governance + E2E כשזמין) | `TEAM_11_TO_TEAM_51_AOS_V3_FINAL_QA_SWEEP_MANDATE_v1.0.0.md` |
| **Team 170** — קידום קאנוני / יישור drift תיעודי | `TEAM_11_TO_TEAM_170_AOS_V3_CANONICAL_PROMOTION_MANDATE_v1.0.0.md` |

## רצף נעילה סופית (שולחן נקי)

1. **Team 51** מחזירה `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_FINAL_QA_SWEEP_EVIDENCE_v1.0.0.md`.  
2. **Team 170** מחזירה `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_11_AOS_V3_CANONICAL_PROMOTION_RECEIPT_v1.0.0.md`.  
3. **Team 11** מאשרת שהשניים ביד Gateway ומעדכנת **Team 10** — מצב *no open tails* לתחילת חבילה חדשה (מנדט + Gate/WP פורמליים בלבד).  
4. **חבילות עתידיות** — רק לפי `AGENTS_OS_V2_OPERATING_PROCEDURES` + `AGENTS.md` (ענף `aos-v3`).

**עדכון 2026-03-29:** שתי המסירות התקבלו — החלטת Gateway: `TEAM_11_AOS_V3_NEXT_PACKAGE_GREEN_LIGHT_v1.0.0.md` (**אור ירוק מותנה**).

---

**log_entry | TEAM_11 | AOS_V3_UI | DIRECT_FIXES_CLOSURE | MANDATES_T51_T170_ISSUED | 2026-03-29**
