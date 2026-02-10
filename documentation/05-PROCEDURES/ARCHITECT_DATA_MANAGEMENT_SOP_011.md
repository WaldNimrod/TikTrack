# 💾 SOP-011 — נוהל משילות: ניהול נתוני סביבה (Zero-Overhead Seeding)

**id:** `SOP-011`
**owner:** Architect
**status:** ✅ **SSOT - ACTIVE**
**last_updated:** 2026-02-09
**version:** v1.0
**source:** `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_DATA_MANAGEMENT_SOP_011.md`

---

1. **Code-First:** נתונים מיוצרים ע"י Python Seeders המשתמשים ב-ORM Models.
2. **Flagging:** שדה is_test_data = true הוא חובה לכל נתון שאינו Base Data.
3. **Operations:** make db-test-fill (לכלוך) | make db-test-clean (ניקוי).
4. **Presentation Layer:** DEFERRED (נדחה עד ליציבות Schema).

---
**log_entry | [Architect] | SOP-011 | SSOT_PROMOTED | 2026-02-09**
