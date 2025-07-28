// src/pages/OrderHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orderHistory")) || [];
    setOrders(storedOrders);
  }, []);

  return (
    <div className="order-history-page">
      <h2 className="order-history-title">Order History</h2>
      <button className="home-btn" onClick={() => navigate("/")}>🏠 Home</button>

      {orders.length === 0 ? (
        <p>No past orders found.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <h3>Order ID: {order.id}</h3>
            <p>Date: {order.date}</p>
            <p>Total: ₹{order.total}</p>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity} = ₹{item.price * item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
