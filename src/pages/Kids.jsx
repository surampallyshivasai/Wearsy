import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import "../styles/Category.css";

const Kids = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const kidsCategories = [
    "Shirts", "Frocks", "Shorts", "Shoes", "Dresses", "T-Shirts"
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("products")) || [];
    const kidsProducts = stored.filter(
      (p) => (p.gender || "").toLowerCase() === "kids"
    );
    setProducts(kidsProducts);
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
      <h2 className="category-heading">Kids' Products</h2>

      <div className="filters">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {kidsCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
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

export default Kids;
