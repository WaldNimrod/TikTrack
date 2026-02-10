# 📋 Team 10 → צוותים 20 ו־30: דרישה לתיקון — מיפוי ברוקרים

**מאת:** Team 10 (The Gateway)  
**אל:** צוות 20 (Backend), צוות 30 (Frontend)  
**תאריך:** 2026-02-10  
**סטטוס:** 🔴 **תיקון נדרש לפני אישור המיפוי**  
**הקשר:** בדיקת פילטר של מסירת `DATA_MAP_FINAL.json`; דוח אימות: `TEAM_10_BROKER_MAPPING_VERIFICATION_REPORT.md`

---

## 1. סיכום

המיפוי ב־`DATA_MAP_FINAL.json` נבדק. **רוב הדרישות מתקיימות.** נדרש **תיקון אחד** לפני שהמיפוי יאושר ויועבר לאישור ויזואלי (נמרוד).

---

## 2. תיקון נדרש (חובה)

### Fallback בהכשלת API

**מיקום בקובץ:**  
`DATA_MAP_FINAL.json` → `ui_mapping.implementation_notes.fallback_behavior`

**טקסט נוכחי (לפי הקובץ):**  
*"If API fails, form should handle gracefully (show error or allow manual entry as fallback - TBD)"*

**סיבת הדרישה:**  
ADR‑013 קבע ש**מקור רשימת הברוקרים = API** (GET /api/v1/reference/brokers). Fallback ל־**manual entry** (שדה טקסט חופשי) סותר את ההחלטה ומחזיר מצב שאינו select דינמי ממקור תקף.

**מה נדרש:**

1. **לעדכן** את השדה `fallback_behavior` (ובכל מקום רלוונטי בהנחיות Frontend) כך שיוגדר במפורש:
   - **בהכשלת API:** הצגת **הודעת שגיאה** למשתמש; **אין** fallback לשדה text input / manual entry.
2. **להסיר** כל אזכור של "allow manual entry as fallback" או "TBD" ביחס ל־fallback מהקובץ וממסמכי המסירה.

**אפשרות חלופית:**  
אם הצוותים מעדיפים לאפשר fallback ל־manual entry — יש **להעביר שאלה מפורשת** דרך Team 10 לאדריכל; עד להחלטה — המיפוי **לא** יאושר עם fallback כזה.

---

## 3. אופציונלי (לא חוסם)

- **response_example** ב־JSON מכיל כרגע 8 פריטים; **valid_brokers_list** מכיל 10. מומלץ ליישר (להרחיב את הדוגמה ל־10 או לסמן "דוגמה חלקית") — לא חובה לאישור.

---

## 4. לאחר ביצוע התיקון

- לעדכן את `_COMMUNICATION/team_20/DATA_MAP_FINAL.json` בהתאם.
- להודיע ל־Team 10 שהתיקון בוצע (קצר: קובץ עודכן, fallback_behavior כנדרש).
- Team 10 יבדוק שוב ויאשר את המיפוי כסופי; אז יועבר לאישור ויזואלי (נמרוד).

---

**Team 10 (The Gateway)**  
**log_entry | BROKER_MAPPING_CORRECTION_REQUEST | ISSUED | 2026-02-10**
