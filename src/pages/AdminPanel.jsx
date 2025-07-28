// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminAuthenticated");
    if (isAdmin === "true") {
      setAuthenticated(true);
    }
  }, []);

  const getAdminPassword = () => {
    return localStorage.getItem("adminPassword") || "admin"; // Default password
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const currentPassword = getAdminPassword();
    if (password === currentPassword) {
      setAuthenticated(true);
      setError("");
      localStorage.setItem("isAdminAuthenticated", "true");
    } else {
      setError("Incorrect password");
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-panel-login">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} className="admin-login-form">
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="admin-password-input"
          />
          <button type="submit">Login</button>
        </form>
        {error && <div className="admin-login-error">{error}</div>}
      </div>
    );
  }

  const goToOrders = () => navigate("/admin/orders");
  const goToProducts = () => navigate("/admin/products");

  return (
    <div className="admin-panel">
      <h2>Admin Dashboard</h2>
      <div className="admin-actions">
        <button onClick={goToOrders}>Manage Orders</button>
        <button onClick={goToProducts}>Manage Products</button>
      </div>
    </div>
  );
};

export default AdminPanel;
