import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database connection
const dbPath = join(__dirname, 'shopping_site.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          image TEXT NOT NULL,
          gender TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          payment_method TEXT NOT NULL,
          status TEXT DEFAULT 'Processing',
          shipping_address TEXT,
          shipping_name TEXT,
          shipping_phone TEXT,
          shipping_city TEXT,
          shipping_pincode TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Cart table
      db.run(`
        CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Saved addresses table
      db.run(`
        CREATE TABLE IF NOT EXISTS saved_addresses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          phone TEXT NOT NULL,
          city TEXT NOT NULL,
          pincode TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Insert default admin user
      const adminPassword = bcrypt.hashSync('admin', 10);
      db.run(`
        INSERT OR IGNORE INTO users (id, name, email, password) 
        VALUES (1, 'Admin', 'admin@shopping.com', ?)
      `, [adminPassword]);

      // Insert sample products
      const sampleProducts = [
        {
          name: "Men's T-Shirt",
          price: 499,
          image: "https://m.media-amazon.com/images/I/51ihmwvPLSL._SX679_.jpg",
          gender: "men",
          category: "tshirt"
        },
        {
          name: "Men's Jeans",
          price: 999,
          image: "https://spykar.com/cdn/shop/files/G7Pvi3ylJ-8905566215245_8.webp?v=1746623891",
          gender: "men",
          category: "jeans"
        },
        {
          name: "Women's Top",
          price: 799,
          image: "https://example.com/women-top.jpg",
          gender: "women",
          category: "top"
        },
        {
          name: "Kid's Shorts",
          price: 299,
          image: "https://example.com/kid-shorts.jpg",
          gender: "kids",
          category: "shorts"
        }
      ];

      sampleProducts.forEach(product => {
        db.run(`
          INSERT OR IGNORE INTO products (name, price, image, gender, category)
          VALUES (?, ?, ?, ?, ?)
        `, [product.name, product.price, product.image, product.gender, product.category]);
      });

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

export default db; 