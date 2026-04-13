import sqlite3
import json
import os

DB_PATH = 'brain.db'

def setup_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. products
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        stock INTEGER NOT NULL DEFAULT 0
    )
    ''')

    # 2. customers
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        zalo TEXT,
        reg_date TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
    ''')

    # 3. orders
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        order_date TEXT NOT NULL DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )
    ''')
    
    conn.commit()
    conn.close()
    print("✓ Đã tạo thành công 3 bảng: products, customers, orders.")

def import_waitlist():
    # possible locations for waitlist.json
    possible_paths = [
        'waitlist.json',
        '../waitlist.json',
        '../../waitlist.json',
        '/Users/baonguyen/Desktop/my-brain/waitlist.json',
        '/Users/baonguyen/Desktop/my-brain/data/customers/waitlist.json'
    ]
    json_path = None
    for p in possible_paths:
        if os.path.exists(p):
            json_path = p
            break
            
    if not json_path:
        print("⚠ Không tìm thấy file waitlist.json trong dự án để import. Đã bỏ qua bước import khách hàng.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        imported = 0
        for item in data:
            name = item.get('name', 'Khách hàng')
            phone = item.get('phone', '')
            zalo = item.get('zalo', item.get('phone_zalo', ''))
            reg_date = item.get('date', item.get('reg_date', ''))
            
            try:
                # Use insert or IGNORE to prevent duplicate phones
                cursor.execute('''
                    INSERT OR IGNORE INTO customers (name, phone, zalo, reg_date)
                    VALUES (?, ?, ?, COALESCE(NULLIF(?, ''), datetime('now','localtime')))
                ''', (name, phone, zalo, reg_date))
                if cursor.rowcount > 0:
                    imported += 1
            except Exception as e:
                print(f"Lỗi insert {phone}: {e}")
                
        conn.commit()
        conn.close()
        print(f"✓ Đã import {imported} khách hàng từ {json_path} vào bảng customers (bỏ qua các SĐT trùng lặp).")
    except Exception as e:
        print(f"Lỗi file JSON: {e}")

if __name__ == '__main__':
    setup_tables()
    import_waitlist()
