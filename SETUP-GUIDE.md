# 📋 מדריך הטמעה: אופטימיזציה של Cursor לניהול עלויות

## סקירה כללית

מדריך זה יעזור לך להגדיר את Cursor לעבודה אופטימלית עם תוכנית Pro+ תוך מזעור צריכת המכסה החודשית.

## 🎯 יעדים

- צמצום צריכת מכסה ב-50-60%
- שימוש במודלים חסכוניים (Gemini)
- הפחתת שימוש ב-Agent Review
- מקסום שימוש ב-Tab Completions (ללא הגבלה)

---

## 📝 שלבי ההטמעה

### שלב 1: הגדרות בסיסיות ב-Cursor Settings

#### 1.1 בחירת מודל ברירת מחדל

1. פתח את Cursor
2. לחץ על **Cursor Settings** (או `Cmd/Ctrl + ,`)
3. עבור ל-**Models**
4. בחר **Gemini 2.5 Flash** כמודל ברירת מחדל
5. וודא ש-**Auto** מכובה

#### 1.2 כיבוי Agent Review אוטומטי

1. ב-Cursor Settings, עבור ל-**Agent → Review**
2. כבה את האופציות הבאות:
   - ❌ **Auto-run on commit**
3. השאר מופעל רק אם באמת צריך:
   - Include submodules (רק אם יש)
   - Include untracked files (רק אם רלוונטי)

---

### שלב 2: יצירת User Rules (כללים גלובליים)

#### 2.1 פתיחת עורך User Rules

1. פתח **Cursor Settings → Rules**
2. לחץ על **New User Rule**
3. העתק והדבק את התוכן הבא:

```markdown
# Cursor Usage Optimization Rules

## 1. Model Selection Policy

- Always use **Gemini 2.5 Flash** as the primary model
- It provides the best cost-to-performance ratio
- Only suggest alternative models if:
  - The user explicitly requests a different model
  - The task has specific requirements that Gemini cannot handle
- Never use Auto model selection

## 2. Response Style

- Be concise and focused
- Avoid unnecessary explanations unless asked
- Get straight to the solution
- Don't repeat information already provided

## 3. Workflow Preferences

When providing coding assistance:

- Suggest using Tab completions for simple code patterns
- Remind me that Tab is unlimited and doesn't consume quota
- For straightforward functions, encourage me to start typing and let Tab complete
- Only write full implementations for:
  - Complex algorithms
  - Multi-step workflows
  - When explicitly requested

## 4. Context Management

- Include only directly relevant files in responses
- Use @symbols to reference specific functions instead of full files
- Avoid suggesting to include entire directories
- Keep context focused and minimal

## 5. Max Mode

- Do NOT suggest Max Mode unless:
  - Working with files over 10,000 lines
  - Analyzing multiple large dependencies simultaneously
  - I explicitly request it
```

4. שמור את הכלל

---

### שלב 3: יצירת Project Rules (כללים ברמת פרויקט)

#### 3.1 יצירת תיקיית Rules

התיקייה כבר נוצרה בפרויקט:

```
your-project/
  .cursor/
    rules/
      review-policy.mdc
      context-optimization.mdc
      tab-first-approach.mdc
```

#### 3.2 קבצי הכללים שנוצרו

כל הקבצים הבאים כבר נוצרו בפרויקט:

1. **`.cursor/rules/review-policy.mdc`** - מדיניות שימוש ב-Agent Review
2. **`.cursor/rules/context-optimization.mdc`** - אופטימיזציה של Context ו-Max Mode
3. **`.cursor/rules/tab-first-approach.mdc`** - עידוד שימוש ב-Tab Completions

#### 3.3 קובץ AGENTS.md

קובץ **`AGENTS.md`** נוצר בשורש הפרויקט ומכיל הנחיות קצרות ופשוטות לשימוש.

---

### שלב 4: הגדרות נוספות (אופציונלי)

#### 4.1 Dashboard Monitoring

1. סמן בדפדפן: **Cursor Dashboard**
2. בדוק פעם בשבוע:
   - צריכת quota נוכחית
   - מודלים שבשימוש
   - סוגי בקשות
   - זהה דפוסים בזבזניים

#### 4.2 Keyboard Shortcuts

למד את הקיצורים הבאים לעבודה מהירה:

- **Tab**: השלמה אוטומטית (השתמש בזה כמה שיותר!)
- **Cmd/Ctrl + L**: פתיחת Chat
- **Cmd/Ctrl + K**: Inline Edit
- **Cmd/Ctrl + Shift + P**: Command Palette

---

## ✅ Checklist - וידוא ההטמעה

לפני שמתחילים לעבוד, וודא:

- [ ] **Gemini 2.5 Flash** מוגדר כמודל ברירת מחדל
- [ ] **Auto model selection** מכובה
- [ ] **Auto-run on commit** מכובה
- [ ] **User Rules** נוצר והופעל
- [ ] **Project Rules** קיימים בפרויקט (`.cursor/rules/`)
- [ ] **AGENTS.md** קיים בשורש הפרויקט
- [ ] **Dashboard** מסומן ונגיש
- [ ] הצוות מודע לשינויים (אם רלוונטי)

---

## 📊 מעקב והגדרות נוספות

### הגדרות ממשק (Settings)

- **Model Picker**: בחר ידנית Gemini 2.5 Flash (אל תשתמש ב-Auto)
- **Dashboard**: בדוק קבוע ב-dashboard

### התראות שימוש

Cursor יודיע לך בעורך כשאתה מתקרב למגבלה - שים לב להתראות האלו!

---

## 🎁 בונוס: Team Rules (אם יש לך צוות)

אם יש לך תוכנית Team, אפשר לאכוף את הכללים האלו על כל הצוות מה-Dashboard:

- סמן **"Enforce this rule"** כדי למנוע מחברי צוות לכבות אותם
- הם יחולו אוטומטית על כולם

---

## 📚 קבצים שנוצרו

1. **`.cursor/rules/review-policy.mdc`** - מדיניות Agent Review
2. **`.cursor/rules/context-optimization.mdc`** - אופטימיזציה של Context
3. **`.cursor/rules/tab-first-approach.mdc`** - גישת Tab-First
4. **`AGENTS.md`** - הנחיות קצרות לשימוש
5. **`SETUP-GUIDE.md`** - מדריך זה

---

## 💡 טיפים נוספים

### עבודה יעילה

1. **התחל עם Tab** - עבור קוד פשוט, התחל להקליד ותן ל-Tab להשלים
2. **השתמש ב-Agent רק כשצריך** - עבור לוגיקה מורכבת או שינויים מרובי קבצים
3. **סקור ידנית שינויים קטנים** - אל תשתמש ב-Agent Review לכל שינוי קטן
4. **שמור על Context מינימלי** - כלול רק קבצים רלוונטיים
5. **עקוב אחרי Quota** - בדוק את ה-Dashboard באופן קבוע

### חיסכון בעלויות

- **Tab Completions**: $0 - השתמש כמה שיותר!
- **Gemini 2.5 Flash**: הכי חסכוני
- **Agent Review**: יקר - רק כשצריך
- **Max Mode**: יקר מאוד - רק בקבצים גדולים מאוד

---

## 🆘 פתרון בעיות

### אם הכללים לא עובדים

1. וודא שהקבצים ב-`.cursor/rules/` עם סיומת `.mdc`
2. בדוק ש-`alwaysApply: true` מוגדר בקבצים
3. רענן את Cursor (Cmd/Ctrl + Shift + P → "Reload Window")
4. בדוק את ה-User Rules ב-Settings

### אם Quota עדיין גבוה

1. בדוק את ה-Dashboard - איזה פעולות צורכות הכי הרבה?
2. וודא ש-Auto-run on commit מכובה
3. בדוק אם אתה משתמש ב-Max Mode שלא לצורך
4. נסה להפחית את גודל ה-Context בכל בקשה

---

**הצלחה! 🎉**

עכשיו אתה מוכן לעבוד עם Cursor בצורה אופטימלית תוך חיסכון בעלויות.

