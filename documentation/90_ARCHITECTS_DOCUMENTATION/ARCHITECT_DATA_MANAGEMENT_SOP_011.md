# 💾 נוהל משילות: ניהול נתוני סביבה (Zero-Overhead Seeding)
---
id: SOP-011 | owner: Architect | status: LOCKED

1. **Code-First:** נתונים מיוצרים ע"י Python Seeders המשתמשים ב-ORM Models.
2. **Flagging:** שדה is_test_data = true הוא חובה לכל נתון שאינו Base Data.
3. **Operations:** make db-test-fill (לכלוך) | make db-test-clean (ניקוי).
4. **Presentation Layer:** DEFERRED (נדחה עד ליציבות Schema).