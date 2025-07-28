import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'server/shopping_site.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️ Shopping Site Database Viewer\n');

// Function to display table data
const showTable = (tableName) => {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${tableName.toUpperCase()} TABLE:`);
    console.log('='.repeat(50));
    
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        console.error(`❌ Error reading ${tableName}:`, err.message);
        reject(err);
      } else {
        if (rows.length === 0) {
          console.log(`No data in ${tableName} table`);
        } else {
          console.table(rows);
        }
        console.log(`Total ${tableName} records: ${rows.length}`);
        resolve(rows);
      }
    });
  });
};

// Function to run custom SQL query
const runQuery = (sql, description) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 ${description}:`);
    console.log('='.repeat(50));
    
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        reject(err);
      } else {
        if (rows.length === 0) {
          console.log('No results found');
        } else {
          console.table(rows);
        }
        console.log(`Total results: ${rows.length}`);
        resolve(rows);
      }
    });
  });
};

// Main function to display database contents
const viewDatabase = async () => {
  try {
    // Show all tables
    await showTable('users');
    await showTable('products');
    await showTable('orders');
    await showTable('order_items');
    await showTable('cart');
    await showTable('saved_addresses');
    
    // Show some useful queries
    await runQuery(
      'SELECT p.name, p.price, p.gender, p.category FROM products p ORDER BY p.price DESC',
      'Products sorted by price (highest first)'
    );
    
    await runQuery(
      'SELECT u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id',
      'Users with their order counts'
    );
    
    await runQuery(
      'SELECT o.order_id, o.total_amount, o.payment_method, o.status, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5',
      'Recent orders with user names'
    );
    
    console.log('\n✅ Database viewing complete!');
    
  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    db.close();
  }
};

// Interactive menu
const showMenu = () => {
  console.log('\n🎛️ Database Viewer Menu:');
  console.log('1. View all tables');
  console.log('2. View users only');
  console.log('3. View products only');
  console.log('4. View orders only');
  console.log('5. Custom SQL query');
  console.log('6. Exit');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nSelect an option (1-6): ', async (answer) => {
    try {
      switch(answer) {
        case '1':
          await viewDatabase();
          break;
        case '2':
          await showTable('users');
          break;
        case '3':
          await showTable('products');
          break;
        case '4':
          await showTable('orders');
          break;
        case '5':
          rl.question('Enter your SQL query: ', async (sql) => {
            await runQuery(sql, 'Custom Query');
            rl.close();
          });
          return;
        case '6':
          console.log('👋 Goodbye!');
          rl.close();
          db.close();
          return;
        default:
          console.log('❌ Invalid option');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    rl.close();
    db.close();
  });
};

// Check if database exists
import fs from 'fs';
if (fs.existsSync(dbPath)) {
  console.log('✅ Database found at:', dbPath);
  showMenu();
} else {
  console.log('❌ Database not found at:', dbPath);
  console.log('Please start the server first: npm run server');
} 