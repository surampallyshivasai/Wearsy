# 🗄️ How to Access Your Database

## 📍 **Database Location**
Your SQLite database is located at:
```
C:\Users\shiva\shopping-site\server\shopping_site.db
```

---

## 🔍 **Method 1: SQLite Browser (GUI - Recommended)**

### **Step 1: Download SQLite Browser**
1. Go to: https://sqlitebrowser.org/
2. Download "DB Browser for SQLite" for Windows
3. Install the application

### **Step 2: Open Your Database**
1. Launch "DB Browser for SQLite"
2. Click **"Open Database"**
3. Navigate to: `C:\Users\shiva\shopping-site\server\`
4. Select `shopping_site.db`
5. Click **"Open"**

### **Step 3: Explore Your Database**
- **Browse Data** tab: View all tables
- **Execute SQL** tab: Run custom queries
- **Database Structure** tab: See table schemas

---

## 💻 **Method 2: Command Line Access**

### **Step 1: Install SQLite CLI**
```bash
# Download SQLite for Windows
# Go to: https://www.sqlite.org/download.html
# Download: sqlite-tools-win32-x86-*.zip
# Extract and add to PATH
```

### **Step 2: Access Database**
```bash
# Navigate to your project
cd C:\Users\shiva\shopping-site

# Open database
sqlite3 server/shopping_site.db
```

### **Step 3: Run Commands**
```sql
-- Show all tables
.tables

-- Show table structure
.schema users
.schema products

-- View all users
SELECT * FROM users;

-- View all products
SELECT * FROM products;

-- View recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Exit SQLite
.quit
```

---

## 🐍 **Method 3: Python Script**

Create a file called `view_db.py`:

```python
import sqlite3
import os

# Database path
db_path = "server/shopping_site.db"

def view_database():
    if not os.path.exists(db_path):
        print("❌ Database not found. Start the server first: npm run server")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🗄️ Shopping Site Database Contents\n")
    
    # Show all tables
    tables = ['users', 'products', 'orders', 'order_items', 'cart', 'saved_addresses']
    
    for table in tables:
        print(f"\n📋 {table.upper()} TABLE:")
        print("=" * 50)
        
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        
        if rows:
            # Get column names
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [col[1] for col in cursor.fetchall()]
            print(f"Columns: {', '.join(columns)}")
            print(f"Total records: {len(rows)}")
            
            # Show first few rows
            for i, row in enumerate(rows[:5]):
                print(f"Row {i+1}: {row}")
            
            if len(rows) > 5:
                print(f"... and {len(rows) - 5} more rows")
        else:
            print("No data in this table")
    
    conn.close()

if __name__ == "__main__":
    view_database()
```

Run it:
```bash
python view_db.py
```

---

## 🌐 **Method 4: Web Interface**

### **Step 1: Install SQLite Web Viewer**
```bash
npm install -g sqlite-web
```

### **Step 2: Start Web Interface**
```bash
# Navigate to your project
cd C:\Users\shiva\shopping-site

# Start web interface
sqlite_web server/shopping_site.db
```

### **Step 3: Access in Browser**
Open: `http://localhost:8080`

---

## 🔧 **Method 5: VS Code Extension**

### **Step 1: Install Extension**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "SQLite Viewer"
4. Install the extension

### **Step 2: Open Database**
1. Right-click on `server/shopping_site.db`
2. Select "Open With..." → "SQLite Viewer"
3. Explore tables and run queries

---

## 📊 **Useful SQL Queries**

### **View All Users**
```sql
SELECT id, name, email, created_at FROM users;
```

### **View All Products**
```sql
SELECT id, name, price, gender, category FROM products ORDER BY price DESC;
```

### **View Recent Orders**
```sql
SELECT o.order_id, o.total_amount, o.payment_method, o.status, u.name as user_name 
FROM orders o 
JOIN users u ON o.user_id = u.id 
ORDER BY o.created_at DESC 
LIMIT 10;
```

### **View Cart Items**
```sql
SELECT c.id, p.name, c.quantity, p.price, u.name as user_name
FROM cart c
JOIN products p ON c.product_id = p.id
JOIN users u ON c.user_id = u.id;
```

### **Count Products by Category**
```sql
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category;
```

### **Find Users with Most Orders**
```sql
SELECT u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
ORDER BY order_count DESC;
```

---

## 🚀 **Quick Start Commands**

### **1. Start Server (Creates Database)**
```bash
npm run server
```

### **2. View Database with Our Script**
```bash
node db-viewer.js
```

### **3. Test Database**
```bash
node test-database.js
```

### **4. Access via Web Interface**
```bash
# Install sqlite-web globally
npm install -g sqlite-web

# Start web interface
sqlite_web server/shopping_site.db

# Open browser to: http://localhost:8080
```

---

## 📁 **Database Structure**

### **Tables in Your Database:**

1. **users** - User accounts
   - id, name, email, password, created_at

2. **products** - Product catalog
   - id, name, price, image, gender, category, created_at

3. **orders** - Order information
   - id, order_id, user_id, total_amount, payment_method, status, shipping_*, created_at

4. **order_items** - Items in orders
   - id, order_id, product_id, quantity, price

5. **cart** - Shopping cart
   - id, user_id, product_id, quantity, created_at

6. **saved_addresses** - User addresses
   - id, user_id, name, address, phone, city, pincode, created_at

---

## 🔐 **Default Data**

### **Admin User**
- Email: `admin@shopping.com`
- Password: `admin` (hashed in database)

### **Sample Products**
- Men's T-Shirt (₹499)
- Men's Jeans (₹999)
- Women's Top (₹799)
- Kid's Shorts (₹299)

---

## 🐛 **Troubleshooting**

### **Database Not Found**
```bash
# Start server to create database
npm run server
```

### **Permission Denied**
- Make sure you have read/write permissions to the server folder
- Try running as administrator if needed

### **SQLite Not Found**
- Download SQLite from: https://www.sqlite.org/download.html
- Add to your system PATH

### **Python Not Found**
- Install Python from: https://python.org
- Make sure it's added to PATH

---

## 🎯 **Recommended Approach**

**For Beginners:**
1. Use **SQLite Browser** (GUI) - Easiest to use
2. Download from: https://sqlitebrowser.org/

**For Developers:**
1. Use **VS Code SQLite Extension** - Integrated with your editor
2. Or use **Command Line** - Most powerful

**For Quick Viewing:**
1. Use our **db-viewer.js** script
2. Run: `node db-viewer.js`

---

*Choose the method that works best for you! 🗄️✨* 