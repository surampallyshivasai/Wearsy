// src/admin/AdminAllOrders.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminAllOrders = () => {
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    setAllOrders(orders);
  }, []);

  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <h2>All Orders (Admin View)</h2>
      <Link to="/admin" style={{ display: 'inline-block', marginBottom: 16, background: '#23272f', color: '#00d4ff', padding: '8px 18px', borderRadius: 7, textDecoration: 'none', fontWeight: 600 }}>Go Back</Link>
      {allOrders.length === 0 ? (
        <p>No orders in the system.</p>
      ) : (
        allOrders.map((order, index) => (
          <div key={index} style={{ border: "1px solid gray", margin: "10px 0", padding: "10px" }}>
            <p><strong>User:</strong> {order.email}</p>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {order.date}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>
            <p><strong>Items:</strong></p>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.name} x {item.quantity}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminAllOrders; // <-- This is required
