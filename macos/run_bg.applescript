-- מריץ פקודה ברקע בלי לפתוח חלון טרמינל, מחזיר שליטה מייד.
on run argv
  set cmd to item 1 of argv
  -- מריצים דרך bash לטעינת פרופיל, ואוספים לוגים
  do shell script "/bin/bash -lc " & quoted form of (cmd & " >> .logs/run_bg.log 2>&1 &")
end run
