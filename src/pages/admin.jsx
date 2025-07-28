// src/pages/Admin.jsx
import React from "react";
import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginTop: "2rem" }}>
        <Link to="/admin/orders" style={linkStyle}>Manage Orders</Link>
        <br /><br />
        <Link to="/admin/products" style={linkStyle}>Manage Products</Link>
      </div>
    </div>
  );
};

const linkStyle = {
  fontSize: "18px",
  color: "#007bff",
  textDecoration: "none",
};

export default Admin;
