import React from "react";
import { Link } from "react-router-dom";
import "./ThankYou.css";

const ThankYou = () => {
  return (
    <div className="thank-you-page">
      <h2>Thank You for Your Order! 🎉</h2>
      <p>Your order has been placed successfully.</p>
      <p>You will receive an email confirmation shortly.</p>
      <Link to="/" className="home-btn">Continue Shopping</Link>
    </div>
  );
};

export default ThankYou;
