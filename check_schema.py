import sqlite3
import json
from pathlib import Path

def get_schema_info(db_path):
    """Extract schema information from SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [table[0] for table in cursor.fetchall() if not table[0].startswith('sqlite_')]
    
    schema_info = {}
    
    for table in tables:
        # Get column information
        cursor.execute(f"PRAGMA table_info({table});")
        columns = cursor.fetchall()
        
        # Get foreign key information
        cursor.execute(f"PRAGMA foreign_key_list({table});")
        foreign_keys = cursor.fetchall()
        
        # Get indexes
        cursor.execute(f"PRAGMA index_list({table});")
        indexes = cursor.fetchall()
        
        index_details = []
        for idx in indexes:
            idx_name = idx[1]
            cursor.execute(f"PRAGMA index_info({idx_name});")
            index_info = cursor.fetchall()
            index_details.append({
                'name': idx_name,
                'unique': bool(idx[2]),
                'columns': [col[2] for col in index_info]
            })
        
        # Sample data (limited to 3 rows)
        try:
            cursor.execute(f"SELECT * FROM {table} LIMIT 3;")
            sample_data = cursor.fetchall()
            column_names = [col[0] for col in cursor.description]
            sample_rows = []
            for row in sample_data:
                sample_rows.append(dict(zip(column_names, row)))
        except:
            sample_rows = []
        
        schema_info[table] = {
            'columns': [
                {
                    'cid': col[0],
                    'name': col[1],
                    'type': col[2],
                    'notnull': bool(col[3]),
                    'default_value': col[4],
                    'pk': bool(col[5])
                } for col in columns
            ],
            'foreign_keys': [
                {
                    'id': fk[0],
                    'seq': fk[1],
                    'table': fk[2],
                    'from': fk[3],
                    'to': fk[4],
                    'on_update': fk[5],
                    'on_delete': fk[6],
                    'match': fk[7]
                } for fk in foreign_keys
            ],
            'indexes': index_details,
            'sample_data': sample_rows
        }
    
    conn.close()
    return schema_info

if __name__ == '__main__':
    db_path = Path('db.sqlite3')
    schema_info = get_schema_info(db_path)
    
    # Print formatted JSON output
    print(json.dumps(schema_info, indent=2))
    
    # Save to file
    with open('db_schema.json', 'w') as f:
        json.dump(schema_info, f, indent=2)
    
    print(f"Schema information saved to db_schema.json")
