# 🕵️ Team 90 → Proposal: Batch Closure Cycle + Smaller Batches

**id:** `TEAM_90_BATCH_CLOSURE_AND_SPLIT_POLICY_PROPOSAL`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (Gateway) + Chief Architect (Gemini Bridge)  
**date:** 2026-02-13  
**status:** 🔶 **PROPOSAL — REQUIRE SSOT PROMOTION**

---

## 1) חובה: סבב סגירה וניקוי שולחן אחרי כל באץ'

**כל באץ' חייב להסתיים ב‑"Closure Cycle" רשמי** לפני מעבר לבאץ' הבא.

### 🔒 שלבי סגירה מחייבים (Closure Cycle)
1. **Consolidation & Knowledge Promotion**
   - סריקת `_COMMUNICATION/` → זיקוק ידע → קידום ל‑`documentation/`.
   - מסמך קונסולידציה בפורמט `CONSOLIDATION_BATCH_[X].md`.
2. **SSOT Consistency Check**
   - אימות שאין סתירות בין Master Index, Page Tracker, Roadmap, Routes, OpenAPI.
   - כל Claim מגובה ב‑Evidence.
3. **Clean Table**
   - כל Open Task חייב להיות מסומן PASS / CLOSED / DATE.
   - אין “ממתין” ללא תאריך.
4. **Archive & Cleanup**
   - העברה פיזית של קבצי תקשורת לארכיון.
   - Manifest חתום + רשימת ניקוי.

### ✅ תנאי מעבר לבאץ' הבא
- Gate A/B/C סגורים (לפי סטטוס הבאץ').
- Consolidation + Archive בוצעו.
- Evidence log מאשר Closing.
- אישור Team 90 + G‑Lead (ויזואלי במידת הצורך).

---

## 2) חלוקת באצים גדולים לתת‑באצים קטנים (Micro‑Batches)

**בעיה:** באצים גדולים יוצרים הצטברות משימות, פערי SSOT, וריצות QA כבדות.

**הצעה:** לאפשר רק באצים בגודל קטן ומבוקר (Micro‑Batch), ולהסיר "Mega‑Batch".

### 📏 הגדרה מומלצת
- **Micro‑Batch = עד 3–5 עמודים** או **תחום אחד + תשתית אחת**.
- כל Micro‑Batch כולל: **UI + Infrastructure + QA + Consolidation**.
- אם נדרש יותר מ‑5 עמודים → מחלקים לתתי‑באצים עוקבים.

### 🔗 דוגמה (Batch 3)
- **Batch 3.1:** Alerts + Notes + SSOT for RT Editor Precision
- **Batch 3.2:** User Tickers + Tickers Admin + Market Data Pipe SSOT
- **Batch 3.3:** Ref Brokers View (Admin read‑only) + Data Pipeline checks

---

## 3) מסמכים חדשים נדרשים (SSOT)

**צוות 10 נדרש לקדם למסמכי SSOT:**
1. **TT2_BATCH_CLOSURE_PROTOCOL.md** — נוהל סגירה מחייב.
2. **TT2_MICRO_BATCH_POLICY.md** — הגדרות גודל, תנאי מעבר, ולוחות זמנים.
3. **TT2_BATCH_DEPENDENCY_STAGE_MINUS_1.md** — Stage‑1 לתלויות חוצות מערכת.

---

## 4) קריטריונים להצלחה

- אין מעבר לבאץ' חדש ללא Closure Cycle מלא.
- כל באץ' מפורק לתת‑באצים קטנים עם QA ייעודי.
- SSOT עדכני תמיד לפני קידוד.
- Evidence לכל Claim.

---

## 5) בקשת פעולה ל‑Team 10

1. לקדם את ההצעה ל‑SSOT במסמכי נהלים.
2. להוציא הודעה לכל הצוותים: **אין קידוד ללא Micro‑Batch + Closure Cycle.**
3. לעדכן Roadmap: פיצול באצים גדולים לתת‑באצים רשמיים.

---

**Prepared by:** Team 90 (The Spy)  
**log_entry | TEAM_90 | BATCH_CLOSURE_AND_SPLIT_POLICY_PROPOSAL | READY | 2026-02-13**
