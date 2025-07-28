import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase, default as db } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize database
initDatabase().then(() => {
  console.log('🚀 Server starting...');
});

// Routes

// 1. Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
          token, 
          user: { id: this.lastID, name, email },
          message: 'Registration successful' 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Login failed' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Login successful' 
    });
  });
});

// 2. Products Routes
app.get('/api/products', (req, res) => {
  const { gender, category, search } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  let params = [];

  if (gender) {
    query += ' AND gender = ?';
    params.push(gender);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (search) {
    query += ' AND (name LIKE ? OR category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Admin only routes
app.post('/api/products', authenticateToken, upload.single('image'), (req, res) => {
  const { name, price, gender, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  if (!name || !price || !gender || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    'INSERT INTO products (name, price, image, gender, category) VALUES (?, ?, ?, ?, ?)',
    [name, price, image, gender, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create product' });
      }
      res.json({ id: this.lastID, name, price, image, gender, category });
    }
  );
});

app.put('/api/products/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { name, price, gender, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  db.run(
    'UPDATE products SET name = ?, price = ?, image = ?, gender = ?, category = ? WHERE id = ?',
    [name, price, image, gender, category, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update product' });
      }
      res.json({ message: 'Product updated successfully' });
    }
  );
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// 3. Cart Routes
app.get('/api/cart', authenticateToken, (req, res) => {
  const query = `
    SELECT c.id, c.quantity, p.* 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `;
  
  db.all(query, [req.user.id], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }
    res.json(cartItems);
  });
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;
  
  // Check if item already in cart
  db.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', 
    [req.user.id, productId], (err, existingItem) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add to cart' });
    }
    
    if (existingItem) {
      // Update quantity
      db.run('UPDATE cart SET quantity = quantity + ? WHERE id = ?', 
        [quantity, existingItem.id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update cart' });
        }
        res.json({ message: 'Cart updated successfully' });
      });
    } else {
      // Add new item
      db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', 
        [req.user.id, productId, quantity], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add to cart' });
        }
        res.json({ message: 'Added to cart successfully' });
      });
    }
  });
});

app.put('/api/cart/:id', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  
  db.run('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', 
    [quantity, req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update cart' });
    }
    res.json({ message: 'Cart updated successfully' });
  });
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM cart WHERE id = ? AND user_id = ?', 
    [req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove from cart' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

app.delete('/api/cart', authenticateToken, (req, res) => {
  db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear cart' });
    }
    res.json({ message: 'Cart cleared successfully' });
  });
});

// 4. Orders Routes
app.get('/api/orders', authenticateToken, (req, res) => {
  const query = `
    SELECT o.*, 
           GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [req.user.id], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(orders);
  });
});

app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total, paymentMethod, shipping } = req.body;
  
  if (!items || !total || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orderId = 'ORDER' + Date.now();
  
  db.run(`
    INSERT INTO orders (order_id, user_id, total_amount, payment_method, 
                       shipping_address, shipping_name, shipping_phone, 
                       shipping_city, shipping_pincode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    orderId, req.user.id, total, paymentMethod,
    shipping?.address || null, shipping?.name || null, 
    shipping?.phone || null, shipping?.city || null, 
    shipping?.pincode || null
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create order' });
    }
    
    const orderId_db = this.lastID;
    
    // Insert order items
    const insertPromises = items.map(item => {
      return new Promise((resolve, reject) => {
        db.run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId_db, item.id, item.quantity, item.price], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    Promise.all(insertPromises).then(() => {
      // Clear cart
      db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
      res.json({ orderId, message: 'Order created successfully' });
    }).catch(err => {
      res.status(500).json({ error: 'Failed to create order items' });
    });
  });
});

// Admin orders management
app.get('/api/admin/orders', authenticateToken, (req, res) => {
  const query = `
    SELECT o.*, u.name as user_name, u.email as user_email,
           GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(orders);
  });
});

app.put('/api/admin/orders/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update order status' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
});

// 5. Saved Addresses Routes
app.get('/api/addresses', authenticateToken, (req, res) => {
  db.all('SELECT * FROM saved_addresses WHERE user_id = ? ORDER BY created_at DESC', 
    [req.user.id], (err, addresses) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch addresses' });
    }
    res.json(addresses);
  });
});

app.post('/api/addresses', authenticateToken, (req, res) => {
  const { name, address, phone, city, pincode } = req.body;
  
  if (!name || !address || !phone || !city || !pincode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(`
    INSERT INTO saved_addresses (user_id, name, address, phone, city, pincode)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [req.user.id, name, address, phone, city, pincode], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save address' });
    }
    res.json({ id: this.lastID, name, address, phone, city, pincode });
  });
});

app.delete('/api/addresses/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM saved_addresses WHERE id = ? AND user_id = ?', 
    [req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete address' });
    }
    res.json({ message: 'Address deleted successfully' });
  });
});

// 6. Admin authentication
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Admin login successful' 
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
}); 