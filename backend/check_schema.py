import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(core_interaction);")
print("Table schema:", cursor.fetchall())

cursor.execute("SELECT * FROM core_interaction LIMIT 1;")
print("Sample row:", cursor.fetchall())

conn.close()
