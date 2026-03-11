import sqlite3
import os
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'historical_prices.db')

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    """Initializes the SQLite database with products and sales tables."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            product_id TEXT PRIMARY KEY,
            brand TEXT,
            model TEXT,
            category TEXT,
            UNIQUE(brand, model)
        )
    ''')
    
    # Sales Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            sale_id TEXT PRIMARY KEY,
            product_id TEXT,
            price REAL,
            condition TEXT,
            platform TEXT,
            timestamp TEXT,
            FOREIGN KEY(product_id) REFERENCES products(product_id)
        )
    ''')
    
    conn.commit()
    conn.close()

def insert_product(brand, model, category):
    conn = get_connection()
    cursor = conn.cursor()
    product_id = str(uuid.uuid4())
    try:
        cursor.execute('''
            INSERT INTO products (product_id, brand, model, category)
            VALUES (?, ?, ?, ?)
        ''', (product_id, brand, model, category))
        conn.commit()
        return product_id
    except sqlite3.IntegrityError:
        # Already exists, fetch ID
        cursor.execute('SELECT product_id FROM products WHERE brand = ? AND model = ?', (brand, model))
        res = cursor.fetchone()
        return res[0] if res else None
    finally:
        conn.close()

def insert_sale(product_id, price, condition, platform, timestamp=None):
    if not timestamp:
        timestamp = datetime.now().isoformat()
        
    conn = get_connection()
    cursor = conn.cursor()
    sale_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO sales (sale_id, product_id, price, condition, platform, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (sale_id, product_id, price, condition, platform, timestamp))
    conn.commit()
    conn.close()
    return sale_id

# Initialize on import
init_db()
