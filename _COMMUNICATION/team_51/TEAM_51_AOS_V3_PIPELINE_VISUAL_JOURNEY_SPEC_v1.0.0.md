---
id: TEAM_51_AOS_V3_PIPELINE_VISUAL_JOURNEY_SPEC_v1.0.0
historical_record: true
from: Team 51 (AOS QA)
to: Principal (Team 00), Team 100, Team 31
date: 2026-03-27
type: QA_SPEC
domain: agents_os
artifact: agents_os_v3/ui/ (mockup)
status: DRAFT — awaits Principal scope decisions (§4)---

# AOS v3 mock — visual pipeline journey (GATE_1–3) + feedback states

## 1. האם הצורך ברור?

| היבט | מצב |
|------|-----|
| **כיוון מוצר** | **כן** — רצף מסכי Pipeline שמשקף חבילת עבודה בכל שער/פאזה, כולל מעגלי משוב/ולידציה ומצבי PASS / BLOCK / fallback קובץ. |
| **יקף צילומים** | **חלקי** — לא הוגדר אם נדרש מכפלה מלאה של *כל* מצב FIP ב-*כל* פאזה, או מטריצה מצומצמת (§4). |
| **יישום במוקאפ הנוכחי** | **לא מספיק** — רוב ה-presets קבועים ל־`GATE_3` / `phase_3_1`; אין סט מובנה של מצבים ל־GATE_1–2 ולכל הפאזות ב־GATE_3; אין preset שמדמה `fallback_required` אוטומטי אחרי כשל Mode B (§3). |

**מסקנה:** הצורך **מובן**; להרצה מלאה נדרשות **הבהרות ב§4** + **הרחבת מוקאפ או פרמטרי URL** (המלצה ל־Team 31) לפני אוטומציית צילום מסך.

---

## 2. בסיס אפיון (SSOT)

- **`TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md`** — §2 (FIP, B→C→D), §3 (OPERATOR HANDOFF), §4 (ingestion UI), טבלאות `next_action`, TC-15..17 (קובץ נמצא / לא נמצא / RAW_PASTE).
- **מוקאפ:** `agents_os_v3/ui/index.html` + `app.js` — רינדור לפי `next_action`, טפסי CONFIRM_ADVANCE / CONFIRM_FAIL, MANUAL_REVIEW, CORRECTION banner.

---

## 3. פערים מול הבקשה (מוקאפ נוכחי)

1. **שערים ופאזות (GATE_1–3)**  
   ב־`MOCK_GATE_PHASES`:  
   - GATE_1: `phase_1_1`, `phase_1_2` (2)  
   - GATE_2: `phase_2_1` … `phase_2_3` (3)  
   - GATE_3: `phase_3_1`, `phase_3_2` (2)  
   **סה״כ 7 תאי gate×phase.** כמעט כל ה־`MOCK_STATE_*` מצביעים על `GATE_3` / `phase_3_1` — אין צילום “אמת” לשאר התאים בלי הרחבה.

2. **“קובץ נמצא / לא נמצא” (Mode B + fallback)**  
   לפי האפיון: כשל Mode B → תגובה עם `fallback_required=true` והצגת אפשרויות C+D.  
   **במוקאפ:** שורות File path / Paste מוסתרות עד לחיצה ידנית על "Provide File Path" / "Paste Feedback" — **אין** מצב מוצג שמדמה אוטומטית “חיפוש נכשל, הנה fallback”.

3. **מעגלי ולידציה בתוך השער**  
   יש presets נפרדים ל־`feedback_pass`, `feedback_fail`, `feedback_low`, `correction_blocking` וכו' — אך כולם **ממוקמים** סביב תרחיש Stage 8B על אותו gate/phase בד״כ. חסר מיפוי מפורש “פאזה X בשער Y = מסך Z”.

4. **GATE_0**  
   לא צוין בבקשה; אם נדרש גם G0 לפני G1 — יש להוסיף שורה למטריצה.

---

## 4. שאלות להחלטת Principal / Team 100 (חובה לפני “כל השלבים”)

1. **GATE_0:** לכלול או לא בחבילת הצילומים?  
2. **מכפלה:** האם נדרש צילום **לכל אחד מ־7 הפאזות** גם עבור **כל** תת-מצב FIP (עשרות צילומים), או:  
   - **שורה א’:** צילום baseline אחד לכל פאזה (למשל `AWAIT_FEEDBACK` + אותו תוכן prompt גנרי), ו־  
   - **שורה ב’:** מצבי משוב (PASS / FAIL block / IL-3 / CORRECTION / SSE) **רק בפאזה ייצוגית אחת** (למשל `GATE_3` / `phase_3_1`)?  
3. **ערכת עיצוב:** צילומים ב־Agents OS dark בלבד, או גם TikTrack light?  
4. **רזולוציה / viewport:** רוחב קבוע (למשל 1440px) לכל האריזה?  
5. **שמות קבצים:** מוסכמה קנונית (למשל `pipeline_g2_p2_1_await_feedback.png`)?

---

## 5. מטריצה מוצעת (מינימום לביצוע אחרי החלטות §4)

| gate | phase | מזהה שורה | מצב `next_action` / הערה |
|------|--------|-----------|----------------------------|
| GATE_1 | phase_1_1 | G1-P1 | Baseline (הגדרה ב־mock) |
| GATE_1 | phase_1_2 | G1-P2 | Baseline |
| GATE_2 | phase_2_1 | G2-P1 | Baseline |
| GATE_2 | phase_2_2 | G2-P2 | Baseline |
| GATE_2 | phase_2_3 | G2-P3 | Baseline |
| GATE_3 | phase_3_1 | G3-P1 | Baseline + (אופציונלי) כל תתי-מצבי 8B כאן בלבד |
| GATE_3 | phase_3_2 | G3-P2 | Baseline |

**תתי-מצבים FIP (להצלבה עם האפיון, מומלץ לפחות פעם אחת כל אחד במוקאפ):**

| מצב | מה המשתמש אמור לראות (תמצית) | סטטוס במוקאפ היום |
|-----|-------------------------------|-------------------|
| AWAIT_FEEDBACK | שלושה כפתורים + CLI | יש (`await_feedback`) |
| אחרי Mode B הצלחה → CONFIRM_ADVANCE | טופס סיכום + Confirm | יש (`feedback_pass`) |
| אחרי FAIL חוסם → CONFIRM_FAIL | BF + route + Confirm Fail | יש (`feedback_fail`) |
| IL-3 → MANUAL_REVIEW | PASS/FAIL + reason | יש (`feedback_low`) |
| CORRECTION + BF | באנר מעל handoff | יש (`correction_blocking`, `escalated`) |
| Mode B כישלון → C+D גלויים | הדגשת fallback | **חסר preset ייעודי** |
| SSE מול polling | אינדיקטור | יש (`sse_connected` + ברירת מחדל) |

---

## 6. המלצה טכנית לבדיקה אוטומטית (אחרי הרחבת מוקאפ)

1. **Team 31:**  
   - או **presets נוספים** בשם קנוני (`g1_p1_await`, …),  
   - או **`?mock_gate=&mock_phase=&mock_scenario=`** שדורס את `current_gate_id` / `current_phase_id` / ענף מצב לפני `applyPreset`.  
2. **Team 51 / CI:**  
   - הוספת Playwright (או כלי צילום MCP קיים) שרץ מול `http://127.0.0.1:8766/...`, לולאת מטריצה, שמירת PNG תחת `_COMMUNICATION/team_51/evidence/pipeline_journey/…` (או נתיב שייאשר Team 10).  

---

## 7. סיכום למענה ישיר לבקשה

- **הצורך ברור מבחינת כיוון** (סיפור משתמש + אפיון FIP).  
- **לא ברור לחלוטין** עד שייסגרו שאלות §4 (בעיקר מכפלה מלאה מול מטריצה מצומצמת).  
- **המוקאפ כיום לא תומך** בצילום מלא של כל פאזות G1–G3 ובמצב “קובץ לא נמצא” כמצב שרת מודגם — נדרשת הרחבה לפני “בדיקה” end-to-end ויזואלית.

**log_entry | TEAM_51 | AOS_V3 | PIPELINE_VISUAL_JOURNEY_SPEC | DRAFT | 2026-03-27**
