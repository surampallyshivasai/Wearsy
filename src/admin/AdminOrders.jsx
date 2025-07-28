import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

const statusOptions = ["Processing", "Shipped", "In Transit", "Delivered"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    
    // Sort orders by date (most recent first)
    const sortedOrders = storedOrders.sort((a, b) => {
      const getOrderDate = (order) => {
        // If order has a date field, use it
        if (order.date) {
          const parsedDate = new Date(order.date);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }

        // Fallback: extract timestamp from order ID
        const orderId = order.id || order.orderId;
        if (orderId && orderId.includes('ORDER')) {
          const timestamp = orderId.replace('ORDER', '');
          if (!isNaN(timestamp)) {
            return new Date(parseInt(timestamp));
          }
        }
        
        // Last resort: use current time
        return new Date();
      };
      
      const dateA = getOrderDate(a);
      const dateB = getOrderDate(b);
      
      return dateB - dateA; // Most recent first
    });

    setOrders(sortedOrders);
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("allOrders", JSON.stringify(updatedOrders));
  };

  return (
    <div className="admin-page">
      <h2>Admin - All Orders</h2>
      <button className="admin-back-btn" onClick={() => navigate(-1)}>Go Back</button>
      <Link to="/" className="admin-home-btn">Home</Link>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Total</th>
              <th>Date</th>
              <th>Items</th>
              <th>Shipping</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>₹{order.total}</td>
                <td>{order.date}</td>
                <td>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id}>{item.name} × {item.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  {order.shipping ? (
                    <>
                      <p><strong>Name:</strong> {order.shipping.name}</p>
                      <p><strong>Address:</strong> {order.shipping.address}</p>
                      <p><strong>Phone:</strong> {order.shipping.phone}</p>
                      <p><strong>City:</strong> {order.shipping.city}</p>
                      <p><strong>Pincode:</strong> {order.shipping.pincode}</p>
                    </>
                  ) : (
                    <p>No shipping info</p>
                  )}
                </td>
                <td>
                  <select
                    value={order.status || "Processing"}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
