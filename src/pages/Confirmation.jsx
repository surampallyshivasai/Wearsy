// src/pages/Confirmation.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Confirmation.css";

const Confirmation = () => {
  return (
    <div className="confirmation-page">
      <h2>Thank You for Your Purchase!</h2>
      <p>Your order has been placed successfully.</p>
      <Link to="/" className="home-link">Go to Home</Link>
    </div>
  );
};

export default Confirmation;
