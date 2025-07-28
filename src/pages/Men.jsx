import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import "../styles/Category.css";

const Men = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("products")) || [];
    const menProducts = stored.filter(
      (p) => (p.gender || "").toLowerCase() === "men"
    );
    setProducts(menProducts);
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortOrder]);

  return (
    <div className="category-page">
      <h2 className="category-heading">Men's Products</h2>

      <div className="filters">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Shirts">Shirts</option>
          <option value="Pants">Pants</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Tracks">Tracks</option>
          <option value="Shoes">Shoes</option>
          <option value="Jeans">Jeans</option> {/* 👈 New category added */}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default Men;
