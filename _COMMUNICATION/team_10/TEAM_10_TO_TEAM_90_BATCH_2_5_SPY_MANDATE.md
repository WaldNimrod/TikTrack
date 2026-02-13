# Team 10 → Team 90: מנדט Spy מוקשח — בץ 2.5 (גרסה 1.0.0)

**אל:** Team 90 (The Spy)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-13  
**מקור:** האדריכלית — G-Lead חתם; המערכת בגרסה 1.0.0 ואינדקס מאוחד.

---

## מנדט מוקשח — חובה לאכוף

1. **פסילת גרסאות 2.x ואינדקס ישן**
   - **פסלו** כל הגשה המכילה גרסה 2.x (בקוד, בתיעוד, ב־package/version).
   - **פסלו** כל הגשה או תיעוד המפנה ל־`D15_SYSTEM_INDEX` או משתמש בו. האינדקס המאוחד היחיד: `00_MASTER_INDEX.md` (תיעוד אדריכל).

2. **חסימת ברוקר "אחר"**
   - **ודאו** חסימה לוגית של ייבוא ושל API עבור חשבונות ברוקר "אחר" (is_supported = false). אין הגדרת API ואין העלאת קבצי ייבוא לחשבון לא נתמך.

3. **Redirect למשתמשים אנונימיים**
   - **ודאו** אכיפה הרמטית של Redirect ל־Home (/) לכל משתמש לא מחובר בכל עמוד שאינו Open.

4. **אייקון משתמש**
   - **אימות** צבעי אייקון משתמש: Success (מחובר) / Warning (מנותק) בלבד. **שחור = פסילה.**

---

## מסמכי יסוד

- ADR-017: `_COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md`
- ADR-018: `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md`
- גרסאות: `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX_v1.0.md`

---

**Team 10 (The Gateway)**  
**log_entry | TEAM_10 | TO_TEAM_90_BATCH_2_5_SPY_MANDATE | 2026-02-13**
