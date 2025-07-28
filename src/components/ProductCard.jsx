import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { cartAPI } from "../services/api";
import "../styles/ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      // Use the API to add to cart
      await cartAPI.addItem(product.id, 1);
      
      // Also update local cart state for immediate UI feedback
      addToCart(product);
      
      // You could show a success message here
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      // You could show an error message here
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} />
      </div>
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={handleAddToCart}>
        {currentUser ? "Add to Cart" : "Login to Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
