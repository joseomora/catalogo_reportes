import sqlite3
import pandas as pd
import os

# Ruta del archivo Excel
excel_path = 'data_excel/BBDD_Organizacion_Reportes_NIA.xlsx'

# Nombre de la base de datos SQLite
db_path = './catalog.db'

# Leer el archivo Excel
df = pd.read_excel(excel_path)

# Conexión a la base de datos SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Crear la tabla en la base de datos (ajustar nombres y tipos de columnas según el Excel)
table_name = 'catalogo'
def map_dtype_to_sqlite(dtype):
    if pd.api.types.is_integer_dtype(dtype):
        return "INTEGER"
    elif pd.api.types.is_float_dtype(dtype):
        return "REAL"
    elif pd.api.types.is_bool_dtype(dtype):
        return "INTEGER"  # SQLite does not have a BOOLEAN type, use INTEGER
    elif pd.api.types.is_datetime64_any_dtype(dtype):
        return "TEXT"  # Store datetime as TEXT in ISO format
    else:
        return "TEXT"  # Default to TEXT for other types

columns = ', '.join([f'"{col}" {map_dtype_to_sqlite(dtype)}' for col, dtype in zip(df.columns, df.dtypes)])
create_table_query = f'CREATE TABLE IF NOT EXISTS {table_name} ({columns});'
cursor.execute(create_table_query)

# Insertar los datos del DataFrame en la tabla
df.to_sql(table_name, conn, if_exists='replace', index=False)

# Confirmar cambios y cerrar conexión
conn.commit()
conn.close()

print(f"Base de datos creada en: {os.path.abspath(db_path)}")