# Team 30 → Team 40: שדרוג ברירת מחדל לשדות טקסט ודרופדאונים

**id:** `TEAM_30_TO_TEAM_40_FORM_FIELDS_DEFAULT_UPGRADE_REQUEST`  
**מאת:** Team 30 (Frontend)  
**עד:** Team 40 (UI Assets & Design)  
**תאריך:** 2026-01-31  
**נושא:** יישור ברירת המחדל של input/select/textarea לעיצוב מודול "הוסף חשבון"

---

## 1. רקע

מודול **הוספת חשבון** (trading account form) מגדיר גודל, ריווח וסגנון עקביים לשדות טקסט ולדרופדאונים. ערכי ברירת המחדל הקודמים ב־`phoenix-base.css` היו שונים (padding קטן, border-radius 4px, צבעי focus שונים).

---

## 2. מה בוצע (Team 30)

עדכנו את `phoenix-base.css` כך שברירת המחדל תתאים למודול "הוסף חשבון":

| מאפיין | ערך קודם | ערך חדש (מתוך modal) |
|--------|----------|------------------------|
| padding | 0.125rem 0.6rem | 8px 16px |
| border-radius | 4px | 6px |
| border | 1px solid #ddd | 1px solid var(--apple-border-light, #e5e5e5) |
| focus/hover color | #ff9500 (orange) | var(--color-brand, #26baac) |
| font-size | inherited | var(--font-size-base, 0.92rem) |

---

## 3. בקשת תאום (Team 40)

1. **אימות DNA** — לוודא שערכי ברירת המחדל החדשים תואמים את סטנדרטי העיצוב ואת LOD 400  
2. **סקירת overrides** — לזהות מסגרות (modals, header filters וכו') שעדיין דורסות ערכים ושאולי כבר אינן נדרשות  
3. **תיעוד SSOT** — לעדכן תיעוד ה־Design System / CSS DNA עם ערכי ברירת המחדל לשדות טקסט ודרופדאונים  

---

## 4. קבצים רלוונטיים

| קובץ | תיאור |
|------|--------|
| `ui/src/styles/phoenix-base.css` | base input/textarea/select |
| `ui/src/styles/phoenix-modal.css` | מודול "הוסף חשבון" — מקור ה-reference |
| `documentation/90_ARCHITECTS_DOCUMENTATION/.../LOD_400_FIDELITY_STANDARDS.md` | סטנדרטי עיצוב |
