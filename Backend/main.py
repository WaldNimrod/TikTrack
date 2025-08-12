import sqlite3

# התחברות לבסיס הנתונים (ודא שהנתיב נכון)
conn = sqlite3.connect("db/simpleTrade.db")
cursor = conn.cursor()

# הכנסת נתון לדוגמה (רק בפעם הראשונה)
cursor.execute("""
INSERT INTO accounts (name, currency, status, cash_balance, total_value, total_pl, notes)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", ("חשבון דמו", "USD", "active", 10000, 10500, 500, "ניסיון ראשון"))
conn.commit()

# שליפה של כל החשבונות
cursor.execute("SELECT * FROM accounts")
rows = cursor.fetchall()

# הדפסה למסך
for row in rows:
    print(row)

conn.close()
