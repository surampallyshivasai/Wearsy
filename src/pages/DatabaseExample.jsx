import React, { useState } from 'react';
import useProducts from '../hooks/useProducts';
import { productsAPI } from '../services/api';
import '../styles/DatabaseExample.css';

const DatabaseExample = () => {
  const [filters, setFilters] = useState({});
  const { products, loading, error } = useProducts(filters);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    gender: 'men',
    category: 'tshirt'
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.create(newProduct);
      setNewProduct({
        name: '',
        price: '',
        image: '',
        gender: 'men',
        category: 'tshirt'
      });
      // Refresh the products list
      window.location.reload();
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="database-example">
      <h1>🗄️ Database Integration Example</h1>
      
      <div className="filters-section">
        <h2>Filter Products</h2>
        <div className="filters">
          <select 
            value={filters.gender || ''} 
            onChange={(e) => handleFilterChange('gender', e.target.value)}
          >
            <option value="">All Genders</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
          
          <select 
            value={filters.category || ''} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="tshirt">T-Shirts</option>
            <option value="jeans">Jeans</option>
            <option value="top">Tops</option>
            <option value="shorts">Shorts</option>
          </select>
          
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      <div className="add-product-section">
        <h2>Add New Product (Admin Only)</h2>
        <form onSubmit={handleAddProduct} className="add-product-form">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
            required
          />
          <input
            type="url"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
            required
          />
          <select
            value={newProduct.gender}
            onChange={(e) => setNewProduct(prev => ({ ...prev, gender: e.target.value }))}
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="tshirt">T-Shirt</option>
            <option value="jeans">Jeans</option>
            <option value="top">Top</option>
            <option value="shorts">Shorts</option>
          </select>
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="products-section">
        <h2>Products from Database ({products.length} items)</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-item">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <p className="product-meta">
                {product.gender} • {product.category}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="api-info">
        <h2>📡 API Endpoints Used</h2>
        <ul>
          <li><strong>GET /api/products</strong> - Fetch all products with filters</li>
          <li><strong>POST /api/products</strong> - Add new product (requires admin token)</li>
          <li><strong>GET /api/cart</strong> - Get user's cart</li>
          <li><strong>POST /api/cart</strong> - Add item to cart</li>
          <li><strong>GET /api/orders</strong> - Get user's orders</li>
          <li><strong>POST /api/orders</strong> - Create new order</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseExample; 