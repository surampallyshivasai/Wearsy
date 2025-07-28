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
    
    # Show some useful queries
    print("\n" + "="*60)
    print("🔍 USEFUL QUERIES:")
    print("="*60)
    
    # Products by category
    cursor.execute("SELECT category, COUNT(*) as count FROM products GROUP BY category")
    categories = cursor.fetchall()
    print("\n📦 Products by Category:")
    for category, count in categories:
        print(f"  {category}: {count} products")
    
    # Recent orders
    cursor.execute("""
        SELECT o.order_id, o.total_amount, o.payment_method, o.status, u.name as user_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 5
    """)
    orders = cursor.fetchall()
    print("\n🛒 Recent Orders:")
    for order in orders:
        print(f"  {order[0]}: ₹{order[1]} ({order[2]}) - {order[3]} by {order[4]}")
    
    conn.close()

if __name__ == "__main__":
    view_database() 