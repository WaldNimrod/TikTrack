## TikTrack — ייצוב “ברזל” לזיהוי משתמשים ופרופילים במערכת ההעדפות

מחבר: Assistant (Cursor)  
בעלות: Nimrod  
הקשר: סטנדרטיזציה בעמוד ההעדפות ובמערכת הפרופילים/משתמשים


### 1) תאור הבעיה (מקיף)

בזרימת ההעדפות קיימת תלות קריטית בזיהוי המשתמש והפרופיל הפעיל. לאורך גרסאות שונות זוהו מצבים שבהם העמוד מציג נתוני ברירת מחדל (User “לא זמין” / Profile “ברירת מחדל”) למרות שה-IDs ידועים ומזוהים מאחור, או לחלופין מבצע טעינת העדפות לפני שסופק Profile Context תקין. התופעות המרכזיות שנצפו:

- עמוד ההעדפות נטען לפני ש-Profile Context הוגדר, וכתוצאה מכך השדות מאוכלסים בערכי ברירת מחדל או אינם מאוכלסים כלל.
- השרת מחזיר `profile_context` עם `resolved_profile_id` אך ללא `resolved_profile` וללא אובייקט `user` מלא; ה-UI מציג “לא זמין”/“ברירת מחדל” אף שמזהים קיימים.
- זרימות לגאסי עקפו את הסדר התקין (Profile → Preferences), גרמו לפער בין מזהים לבין תצוגה (IDs מעודכנים, שמות לא).
- רכיבי משנה (כמו Lazy Loader/צבעים) ניסו לטעון פריטים נקודתיים (single preference) שאינם קיימים כסוגי העדפות בודדים, ויצרו שגיאות 404 בזמן אתחול.

השפעה:

- חוויית משתמש לא עקבית — תצוגת שם פרופיל/משתמש לא תואמת ל-ID הפעיל.
- תלות מסוכנת של עמודים ותהליכים אחרים בנתון מזהה שאינו מסונכרן.
- רעש לוגים וטעינות כפולות/מוקדמות שמעלות סיכון לקריסות או למצב נתונים לא אמין.


### 2) ניתוח מצב (מקיף)

המערכת מורכבת ממספר שכבות: `PreferencesUI` (זרימת UI), `PreferencesCore` (לוגיקה), `PreferencesData` (Data Service), וממשקי API בצד השרת. המפתח ליציבות הוא Profile Context אחיד ומוקדם:

- בצד השרת: `GET /api/preferences/user` מחזיר `profile_context` עם שדות מזהים (לפחות `resolved_profile_id`), אך לא תמיד כולל `resolved_profile` מלא ואובייקט `user` מלא.
- בצד הלקוח: `PreferencesUI.loadAllPreferences()` אמור לטעון Profile Context ואז להמשיך לטעינת ההעדפות; במקרים מסוימים זרימות לגאסי קפצו ישר לטעינת העדפות ללא Context מלא.
- רכיבי Lazy Loading נקראו לנושאים שאינם פריטי העדפה בודדים (כגון צבעי התראות), ויצרו 404 בזמן אתחול.
- תצוגת ה-UI (`updateActiveUserDisplay`, `updateActiveProfileDisplay`) נשענה על `user.display_name` ועל `resolved_profile.name`. כשחסר, הוצג “לא זמין” / “ברירת מחדל” גם כאשר ה-IDים ידועים.

תצפיות מהלוגים:

- `resolved_profile_id=2` הוחזר מהשרת ועבר עדכון ב-UI/Core (כלומר ה-ID תקין), אך עדיין הוצגה תווית “ברירת מחדל” — סימן שחסרו פרטי שם/אובייקט מלאים.
- לאחר הסרת טעינות צבעים נקודתיות ויישור אתחול ל-PreferencesUI בלבד, שגיאות 404 נעלמו והסדר השתפר — אך נדרש החוזה המלא של Profile Context ליציבות מקסימלית.


### 3) פתרון מוצע (מקיף, “ברזל”)

א. חוזה API מחייב לכל נקודות הנתונים (שרת)

- בכל מענה שמחזיר העדפות/פרופילים, יש להחזיר `profile_context` מלא ככל האפשר:
  - `user`: `{ id, username, display_name }` (לפחות `id` ו-Label מתאים לשם תצוגה)
  - `resolved_profile_id` (חובה)
  - `resolved_profile`: `{ id, name, description, is_default }`
  - `active_profile_id` אם קיים
- כאשר `resolved_profile` לא זמין (מידע חסר), יש להחזיר אובייקט מינימלי: `{ id: resolved_profile_id, name: 'Profile #<id>' }` ולא להשאיר `null`.
- אחידות החוזה ב-`/api/preferences/user`, `/user/group`, `/user/single`, `/profiles` — אותו פורמט `profile_context`.

ב. מקור אמת יחיד ב-Frontend (PreferencesUI/Core)

- מקור אמת אחד: `profileContext` שחוזר מהשרת ומוזרם דרך `PreferencesUI.loadAllPreferences()` → `updateProfileContext()`.
- אם השרת החזיר רק IDs ללא שמות/אובייקטים:
  - השלמת נתונים חד-פעמית דרך `GET /api/preferences/profiles`, איתור הפרופיל לפי `resolved_profile_id`, והזרקת `resolved_profile` + `user` ל-`updateProfileContext()`.
  - שמירת התוצאה ב-`PreferencesCore.latestProfileContext` והפצתה לכל המערכות (UI, Lazy Loader, Color System).

ג. סדר אתחול מחייב (Frontend)

1) `PreferencesUI.loadAllPreferences()`
2) טעינת פרופילים (במידת הצורך) וקביעת `currentUserId/currentProfileId`
3) בקשת `GET /api/preferences/user` לקבלת `profile_context` ונתונים
4) `updateProfileContext(profileContext)`
5) Populate UI + מערכות צבעים/סטטיסטיקות

- אין Populate לפני `updateProfileContext`.
- בעת החלפת פרופיל: קודם `ProfileManager.switchProfile()` → ריענון מטמון → `PreferencesUI.loadAllPreferences()` → עדכון UI.

ד. התנהגות UI ברירת מחדל (ללא נפילות)

- כשיש `id` אך חסר `display_name`/`name`: להציג תמיד “User #<id>” ו-“Profile #<id>” במקום “לא זמין/ברירת מחדל”.
- לא להציג `null`/ריק במזהים ידועים; ה-Label חייב להיות תמיד יציב.
- כפתורי ניהול (החלפה/יצירה) נסמכים על IDs, לא על שמות, כדי לשמור על פונקציונליות מלאה גם במצב מינימלי.

ה. הימנעות מקריאות נקודתיות ל-preferences שאינן קיימות כסוגים בודדים

- Lazy Loader לא יבצע טעינות ל-keys שאינם preference types עצמאיים (למשל צבעי התראות). צבעים נטענים דרך הזנה מרוכזת (קבוצה/כולל).

ו. ניטור ו-Diagnostics

- לוג מאוחד “Profile Context Snapshot” אחרי כל `updateProfileContext`: `userId`, `resolvedProfileId`, `hasResolvedProfile`, `hasUser`.
- מונה השלמות (`completionsCount`) במהלך אתחול — אם הספירה חוצה סף (למשל >3), לוג אזהרה אדמיניסטרטיבי (לא למשתמש).

ז. בדיקות (חובה)

- FE Integration:
  - מקרה מלא: `profile_context` מלא → UI מציג שם ותיאור תקינים.
  - חסר user: השלמה מה-`/profiles` → תצוגה יציבה.
  - חסר resolved_profile: שימוש ב-“Profile #<id>” עד השלמה → אין “ברירת מחדל” לא תואם.
  - מצב IDs בלבד: תמיד מציגים “User #<id>” ו-“Profile #<id>”.

- API Contract Tests:
  - אימות שכל ה-Endpoints הרלוונטיים מחזירים `profile_context` עם `resolved_profile_id` תמיד, ושדות נוספים לפי החוזה.


### 4) תרשים זרימה (תמציתי)

שרת → `GET /api/preferences/user` → מחזיר `profile_context` (מלא ככל האפשר)  
לקוח → `PreferencesUI.loadAllPreferences()` → `updateProfileContext()`  
אם חסר `resolved_profile`/`user` → `GET /api/preferences/profiles` → השלמה → `updateProfileContext()`  
→ Populate UI + Systems (צבעים, סטטיסטיקות)  


### 5) תועלות מרכזיות

- יציבות תצוגה: אין “נפילות” לשמות חסרים כאשר IDs ידועים.
- אחידות זרימה וכללים ברורם לכל המודולים.
- צמצום טעינות חוזרות/שגיאות 404 (במיוחד בצבעים).
- בסיס אמין לשימוש רוחבי בכל הממשקים והתהליכים במערכת.


### 6) סטטוס יישום

- בוצע: הסרת פולבקים, העדפת זרימת PreferencesUI, הסרת טעינות נקודתיות לצבעים, סנכרון context לפעמים שמגיעים דרך זרימת לגאסי, טרייס ואבחון.
- לביצוע (שרת): החזרת `profile_context` מחוזק ומלא בכל ה-Endpoints העיקריים.
- לביצוע (לקוח): השלמות מבוקרות ל-`resolved_profile`/`user` בעת חסרים, וידוא Labels יציבים לפי IDs, בדיקות FE נוספות.


### 7) קישורים רלוונטיים

- `documentation/USER_PAGES_STANDARDIZATION/Preferences-Standardization-Plan-and-Status.md`  
- `trading-ui/scripts/preferences-ui.js` (updateProfileContext, loadAllPreferences)  
- `trading-ui/scripts/preferences-core-new.js` (latestProfileContext, getAllPreferences)  
- `trading-ui/scripts/preferences-lazy-loader.js` (טעינות לפי עדיפות)  
- `Backend/routes/api/preferences.py` (מבנה Profile Context והעדפות)  



