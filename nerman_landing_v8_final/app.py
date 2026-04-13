from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__, static_folder='.', static_url_path='')

def get_db_connection():
    conn = sqlite3.connect('brain.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/thanh-toan')
def payment():
    return render_template('payment.html')

# ================= PRODUCTS API =================
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO products (name, price, description, stock) VALUES (?, ?, ?, ?)',
                   (data['name'], data['price'], data.get('description', ''), data['stock']))
    conn.commit()
    conn.close()
    return jsonify({'success': True}), 201

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM products WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('UPDATE products SET name = ?, price = ?, description = ?, stock = ? WHERE id = ?',
                 (data['name'], data['price'], data['description'], data['stock'], id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ================= CUSTOMERS API =================
@app.route('/api/customers', methods=['GET'])
def get_customers():
    conn = get_db_connection()
    customers = conn.execute('SELECT * FROM customers').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in customers])

@app.route('/api/customers', methods=['POST'])
def add_customer():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO customers (name, phone, zalo, reg_date) VALUES (?, ?, ?, datetime("now","localtime"))',
                       (data['name'], data['phone'], data.get('zalo', '')))
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        success = False 
    conn.close()
    return jsonify({'success': success}), 201 if success else 400

@app.route('/api/customers/<int:id>', methods=['DELETE'])
def delete_customer(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM customers WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/customers/<int:id>', methods=['PUT'])
def update_customer(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('UPDATE customers SET name = ?, phone = ?, zalo = ? WHERE id = ?',
                 (data['name'], data['phone'], data['zalo'], id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ================= ORDERS API =================
@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    query = '''
        SELECT o.id, c.name as customer_name, p.name as product_name, o.amount, o.status, o.order_date, o.quantity, o.address
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        JOIN products p ON o.product_id = p.id
        ORDER BY o.id DESC
    '''
    orders = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in orders])

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    name = data['name']
    phone = data['phone']
    address = data['address']
    product_id = int(data['product_id'])
    quantity = int(data.get('quantity', 1))

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. UPSERT Customer
    cursor.execute('SELECT id FROM customers WHERE phone = ?', (phone,))
    row = cursor.fetchone()
    if row:
        customer_id = row['id']
        cursor.execute('UPDATE customers SET name = ? WHERE id = ?', (name, customer_id))
    else:
        cursor.execute('INSERT INTO customers (name, phone, reg_date) VALUES (?, ?, datetime("now","localtime"))', (name, phone))
        customer_id = cursor.lastrowid
        
    # 2. Get Price
    cursor.execute('SELECT price FROM products WHERE id = ?', (product_id,))
    prod_row = cursor.fetchone()
    price = float(prod_row['price']) if prod_row else 350000.0
    amount = price * quantity

    # 3. Update Stock
    cursor.execute('UPDATE products SET stock = stock - ? WHERE id = ?', (quantity, product_id))

    # 4. Create Order
    cursor.execute('''
        INSERT INTO orders (customer_id, product_id, amount, status, quantity, address, order_date) 
        VALUES (?, ?, ?, ?, ?, ?, datetime("now","localtime"))
    ''', (customer_id, product_id, amount, 'Chờ thanh toán', quantity, address))
    
    order_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'order_id': order_id, 'amount': amount})

import os
SEPAY_TOKEN = os.environ.get("SEPAY_API_KEY", "XIXZODOUHRDU7ML7JN5TA9EXOSQUI1AWCS86YP2UPCBP3NDZK8LL4G52ZNQLAOJV")

@app.route('/api/check-payment/<int:order_id>', methods=['GET'])
def check_payment(order_id):
    conn = get_db_connection()
    order = conn.execute('SELECT amount, status FROM orders WHERE id = ?', (order_id,)).fetchone()
    if not order:
        return jsonify({"paid": False, "error": "Not found"})
        
    # Đã cập nhật từ trước (ví dụ qua simulate hoặc hook)
    if order['status'] == 'Hoàn thành':
        return jsonify({"paid": True})
        
    expected_amount = float(order['amount'])
    expected_content = f"MUA NERMAN DH{order_id}"
    
    # LÀM THẬT: Lắng nghe qua API SePay
    if SEPAY_TOKEN != "YOUR_SEPAY_TOKEN_HERE" and SEPAY_TOKEN.strip() != "":
        import requests
        try:
            headers = {'Authorization': f'Bearer {SEPAY_TOKEN}', 'Content-Type': 'application/json'}
            res = requests.get('https://my.sepay.vn/userapi/transactions/list', headers=headers, params={'limit': 10})
            data = res.json()
            if data.get('status') == 200:
                for tx in data.get('transactions', []):
                    amount_in = float(tx.get('amount_in', 0))
                    content = tx.get('transaction_content', '').upper()
                    if amount_in >= expected_amount and expected_content in content:
                        conn.execute("UPDATE orders SET status = 'Hoàn thành' WHERE id = ?", (order_id,))
                        conn.commit()
                        conn.close()
                        return jsonify({"paid": True})
        except Exception as e:
            print("SePay Error:", e)

    conn.close()
    return jsonify({"paid": False})

@app.route('/api/simulate-payment/<int:order_id>', methods=['POST'])
def simulate_payment(order_id):
    """Giả lập có tiền vào để test nộp bài mà không tốn tiền thật"""
    conn = get_db_connection()
    conn.execute("UPDATE orders SET status = 'Hoàn thành' WHERE id = ?", (order_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/orders', methods=['POST'])
def add_order():
    data = request.json
    customer_id = data['customer_id']
    product_id = data['product_id']
    amount = data['amount']
    status = data.get('status', 'Chờ thanh toán')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # KHI THÊM MỚI ĐƠN HÀNG => TỰ ĐỘNG TRỪ SỐ LƯỢNG SẢN PHẨM CÒN LẠI
    cursor.execute('UPDATE products SET stock = stock - 1 WHERE id = ?', (product_id,))
    
    cursor.execute('INSERT INTO orders (customer_id, product_id, amount, status, order_date) VALUES (?, ?, ?, ?, datetime("now","localtime"))',
                   (customer_id, product_id, amount, status))
    conn.commit()
    conn.close()
    return jsonify({'success': True}), 201

@app.route('/api/orders/<int:id>', methods=['DELETE'])
def delete_order(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM orders WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/orders/<int:id>', methods=['PUT'])
def update_order(id):
    data = request.json
    conn = get_db_connection()
    conn.execute('UPDATE orders SET status = ?, quantity = ?, address = ? WHERE id = ?',
                 (data['status'], data['quantity'], data['address'], id))
    
    product_id_row = conn.execute('SELECT product_id FROM orders WHERE id = ?', (id,)).fetchone()
    if product_id_row:
        p_row = conn.execute('SELECT price FROM products WHERE id = ?', (product_id_row['product_id'],)).fetchone()
        if p_row:
            new_amount = float(p_row['price']) * int(data['quantity'])
            conn.execute('UPDATE orders SET amount = ? WHERE id = ?', (new_amount, id))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
