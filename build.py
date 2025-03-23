# build.py
import sqlite3
import json

def generar_data_json(db_path, table_name, json_filename):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    col_names = [desc[0] for desc in cursor.description]

    data = []
    for row in rows:
        row_dict = {}
        for col, val in zip(col_names, row):
            row_dict[col] = val
        data.append(row_dict)
    
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    conn.close()

if __name__ == "__main__":
    DB_PATH = "catalog.db"       
    TABLE_NAME = "catalogo"      
    JSON_FILENAME = "data.json"  

    generar_data_json(DB_PATH, TABLE_NAME, JSON_FILENAME)
    print("data.json generado correctamente.")
