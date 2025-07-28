# 🛒 Shopping Site

A modern e-commerce platform built with React, Express.js, and SQLite database.

## 🚀 Features

- **User Authentication**: Secure login/register with JWT tokens
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add, remove, and manage cart items
- **Order Management**: Complete checkout process with multiple payment methods
- **Admin Panel**: Manage products, orders, and user data
- **Database Storage**: Persistent data storage with SQLite
- **File Upload**: Image upload for product management
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **CSS3** - Styling and animations

### Backend
- **Express.js** - Server framework
- **SQLite3** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopping-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   npm run server  # Backend (port 5000)
   npm run dev     # Frontend (port 5173)
   ```

## 🗄️ Database Setup

The application uses SQLite database which is automatically initialized when you start the server.

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT NOT NULL,
  gender TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
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
);
```

#### Cart Table
```sql
CREATE TABLE cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
);
```

## 🔐 Authentication

### Default Admin Account
- **Email**: admin@shopping.com
- **Password**: admin

### User Registration
Users can register with:
- Name
- Email (unique)
- Password (hashed with bcrypt)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status (admin)

### Addresses
- `GET /api/addresses` - Get saved addresses
- `POST /api/addresses` - Save new address
- `DELETE /api/addresses/:id` - Delete address

## 🎯 Usage

### For Users
1. **Register/Login** - Create an account or sign in
2. **Browse Products** - View products by category (Men/Women/Kids)
3. **Add to Cart** - Add products to your shopping cart
4. **Checkout** - Complete purchase with shipping and payment details
5. **Track Orders** - View order history and status

### For Admins
1. **Admin Login** - Use admin credentials to access admin panel
2. **Manage Products** - Add, edit, or delete products
3. **Manage Orders** - View all orders and update status
4. **Upload Images** - Upload product images during creation/editing

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
```

## 📁 Project Structure

```
shopping-site/
├── public/
│   ├── uploads/          # Product images
│   └── shopping-site-favicon.svg
├── server/
│   ├── database.js       # Database setup
│   ├── index.js          # Express server
│   └── shopping_site.db  # SQLite database
├── src/
│   ├── components/       # React components
│   ├── context/          # React context
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── styles/          # CSS files
└── package.json
```

## 🚀 Deployment

### Local Development
```bash
npm run dev:full
```

### Production Build
```bash
npm run build
npm run server
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Server-side validation
- **File Upload Security** - Image type and size validation
- **SQL Injection Protection** - Parameterized queries

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **Database not initializing**
   ```bash
   # Delete and recreate database
   rm server/shopping_site.db
   npm run server
   ```

3. **CORS errors**
   - Ensure backend is running on port 5000
   - Check API_BASE_URL in src/services/api.js

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Happy Shopping! 🛒✨**
