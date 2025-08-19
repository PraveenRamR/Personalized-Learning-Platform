import sqlite3

# Connect to the database
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

try:
    # Check if context column exists
    cursor.execute("PRAGMA table_info(core_interaction);")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    print("Current columns:", column_names)
    
    # If context doesn't exist, add it
    if 'context' not in column_names:
        print("Adding context column...")
        cursor.execute("ALTER TABLE core_interaction ADD COLUMN context TEXT DEFAULT '{}'")
        conn.commit()
        print("Column added successfully")
    else:
        print("Context column already exists")

    # Check schema after changes
    cursor.execute("PRAGMA table_info(core_interaction);")
    print("Updated columns:", [col[1] for col in cursor.fetchall()])
    
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
