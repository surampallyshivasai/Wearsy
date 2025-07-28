import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

const MyOrders = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Get orders from multiple sources to ensure we capture all orders
    const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const latestOrder = JSON.parse(localStorage.getItem("latestOrder"));
    
    // Try to fix orders missing shipping information by checking latestOrder
    if (latestOrder && latestOrder.shipping) {
      const updatedOrders = orders.map(order => {
        if (!order.shipping && order.userEmail === currentUser.email) {
          return { ...order, shipping: latestOrder.shipping };
        }
        return order;
      });
      if (JSON.stringify(updatedOrders) !== JSON.stringify(orders)) {
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      }
    }
    
    // Combine all order sources
    let combinedOrders = [...allOrders, ...orderHistory, ...orders];
    
    // Add latest order if it exists and belongs to current user
    if (latestOrder && (latestOrder.userEmail === currentUser.email || latestOrder.email === currentUser.email)) {
      combinedOrders.push(latestOrder);
    }
    
    // Filter orders for current user and remove duplicates
    const userOrderMap = new Map();
    
    combinedOrders.forEach(order => {
      const orderEmail = order.userEmail || order.email;
      if (orderEmail === currentUser.email) {
        // Use order ID as key to avoid duplicates
        const orderId = order.id || order.orderId;
        if (!userOrderMap.has(orderId)) {
          userOrderMap.set(orderId, order);
        }
      }
    });
    
    // Convert to array and sort by date (most recent first)
    const sortedOrders = Array.from(userOrderMap.values()).sort((a, b) => {
      const dateA = getOrderDate(a);
      const dateB = getOrderDate(b);
      
      // If both dates are null, maintain original order
      if (!dateA && !dateB) return 0;
      
      // If one date is null, put it at the end
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateB - dateA; // Most recent first
    });
    
    console.log('Found orders:', sortedOrders.length);
    console.log('Order dates:', sortedOrders.map(order => ({
      id: order.id || order.orderId,
      date: order.date,
      parsed: getOrderDate(order)
    })));
    
    setUserOrders(sortedOrders);
    setLoading(false);
  }, [currentUser]);

  const getOrderDate = (order) => {
    // If order has a date field, use it
    if (order.date) {
      const parsedDate = new Date(order.date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    // Try orderDate field as well
    if (order.orderDate) {
      const parsedDate = new Date(order.orderDate);
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
    
    // If we still can't get a date, try to use the order creation time
    if (order.createdAt) {
      const parsedDate = new Date(order.createdAt);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    // Try to parse any other date-like fields
    if (order.timestamp) {
      const parsedDate = new Date(order.timestamp);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    // Last resort: return null instead of current time
    return null;
  };

  const formatDate = (dateString) => {
    const date = getOrderDate({ date: dateString });
    if (!date) {
      return "Unknown Date";
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatus = (order) => {
    // If admin has set a status, use it
    if (order.status) {
      // Color logic for status
      let color = '#ffc107';
      if (order.status === 'Shipped') color = '#17a2b8';
      else if (order.status === 'In Transit') color = '#007bff';
      else if (order.status === 'Delivered') color = '#28a745';
      return { status: order.status, color };
    }
    // Fallback: Simple status logic
    const orderDate = getOrderDate(order);
    if (!orderDate) {
      return { status: 'Unknown', color: '#6c757d' };
    }
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceOrder === 0) return { status: 'Processing', color: '#ffc107' };
    if (daysSinceOrder <= 3) return { status: 'Shipped', color: '#17a2b8' };
    if (daysSinceOrder <= 7) return { status: 'In Transit', color: '#007bff' };
    return { status: 'Delivered', color: '#28a745' };
  };

  const printOrderReceipt = (order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const orderDate = getOrderDate(order);
    const orderStatus = getOrderStatus(order);
    const orderId = order.id || order.orderId;
    const orderItems = order.items || [];
    const orderTotal = order.total || 0;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${orderId}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #333;
            border-radius: 10px;
            padding: 30px;
            background: white;
          }
          .receipt-header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .receipt-header h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .receipt-header p {
            color: #666;
            margin: 5px 0;
            font-size: 16px;
          }
          .order-details {
            margin-bottom: 30px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #333;
          }
          .detail-value {
            color: #666;
          }
          .status-badge {
            background: ${orderStatus.color};
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .items-section {
            margin-bottom: 30px;
          }
          .items-section h3 {
            color: #333;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item-info {
            flex: 1;
          }
          .item-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }
          .item-details {
            color: #666;
            font-size: 14px;
          }
          .item-price {
            font-weight: 700;
            color: #333;
            font-size: 16px;
          }
          .shipping-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #00d4ff;
          }
          .shipping-section h3 {
            color: #333;
            margin: 0 0 15px 0;
          }
          .shipping-section p {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
          }
          .total-section {
            border-top: 2px solid #333;
            padding-top: 20px;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 18px;
          }
          .total-amount {
            font-weight: 700;
            color: #4CAF50;
            font-size: 24px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          @media print {
            body { margin: 0; }
            .receipt-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <h1>🛒 Shopping Site</h1>
            <p>Order Receipt</p>
            <p>Thank you for your purchase!</p>
          </div>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Order ID:</span>
              <span class="detail-value">${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Date:</span>
              <span class="detail-value">${orderDate ? orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Unknown Date'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="status-badge">${orderStatus.status}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${order.paymentMethod === "COD" ? "Cash on Delivery" : 
                order.paymentMethod === "Card" ? "Debit/Credit Card" : 
                order.paymentMethod === "UPI" ? "UPI Payment" : 
                order.paymentMethod ? order.paymentMethod : "Unknown"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">${currentUser?.name || currentUser?.email || 'Guest'}</span>
            </div>
          </div>
          
          <div class="items-section">
            <h3>📦 Items Ordered (${orderItems.length})</h3>
            ${orderItems.map(item => `
              <div class="item">
                <div class="item-info">
                  <div class="item-name">${item.name || 'Unknown Product'}</div>
                  <div class="item-details">Quantity: ${item.quantity || 1}</div>
                </div>
                <div class="item-price">₹${item.price || 0}</div>
              </div>
            `).join('')}
          </div>
          
          ${order.shipping && (order.shipping.name || order.shipping.address || order.shipping.city) ? `
            <div class="shipping-section">
              <h3>📍 Shipping Address</h3>
              <p><strong>${order.shipping.name || 'N/A'}</strong></p>
              <p>${order.shipping.address || 'N/A'}</p>
              <p>${order.shipping.city || 'N/A'}, ${order.shipping.pincode || 'N/A'}</p>
            </div>
          ` : ''}
          
          <div class="total-section">
            <div class="total-row">
              <span>Total Amount:</span>
              <span class="total-amount">₹${orderTotal}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>For any queries, please contact our customer support.</p>
            <p>Generated on: ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
  };

  if (!currentUser) {
    return (
      <div className="my-orders-page">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please log in to view your orders.</p>
          <button onClick={() => navigate("/login")} className="login-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="loading">
          <div className="loading-spinner">⏳</div>
          <h2>Loading your orders...</h2>
          <p>Please wait while we fetch your order history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Welcome back, {currentUser.name || currentUser.email}</p>
          <button 
            onClick={() => navigate("/")} 
            className="back-home-btn"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '15px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            ← Back to Home
          </button>
        </div>

      {userOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your order history here!</p>
            <button onClick={() => navigate("/")} className="shop-now-btn">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {userOrders.map((order, index) => {
              const orderStatus = getOrderStatus(order);
              const orderId = order.id || order.orderId;
              const orderDate = order.date || order.orderDate;
              const orderItems = order.items || [];
              const orderTotal = order.total || 0;
              
              // Get the actual order date for display
              const actualOrderDate = getOrderDate(order);
              
              return (
                <div key={index} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{orderId}</h3>
                      <p className="order-date">
                        {actualOrderDate ? actualOrderDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "Unknown Date"}
                      </p>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: orderStatus.color }}
                      >
                        {orderStatus.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-items">
                      <h4>Items ({orderItems.length})</h4>
                      <div className="items-grid">
                        {orderItems.map((item, itemIndex) => (
                          <div key={itemIndex} className="item-summary">
                            <div className="item-image">
                              <img 
                                src={item.image} 
                                alt={item.name || 'Product'} 
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                                }}
                              />
                            </div>
                            <div className="item-details">
                              <p className="item-name">{item.name || 'Unknown Product'}</p>
                              <p className="item-quantity">Qty: {item.quantity || 1}</p>
                              <p className="item-price">₹{item.price || 0}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-sidebar">
                      {order.shipping && (order.shipping.name || order.shipping.address || order.shipping.city) ? (
                        <div className="shipping-info">
                          <h4>Shipping Address</h4>
                          <p>{order.shipping.name || 'N/A'}</p>
                          <p>{order.shipping.address || 'N/A'}</p>
                          <p>{order.shipping.city || 'N/A'}, {order.shipping.pincode || 'N/A'}</p>
                        </div>
                      ) : (
                        <div className="shipping-info">
                          <h4>Shipping Address</h4>
                          <p style={{ color: '#888', fontStyle: 'italic' }}>No shipping address available</p>
                        </div>
                      )}

                      <div className="order-summary">
                        <div className="payment-info">
                          <span>Payment:</span>
                          <span className="payment-method">
                            {order.paymentMethod === "COD" ? "Cash on Delivery" : 
                             order.paymentMethod === "Card" ? "Debit/Credit Card" : 
                             order.paymentMethod === "UPI" ? "UPI Payment" : 
                             order.paymentMethod ? order.paymentMethod : "Unknown"}
                          </span>
                        </div>
                        <div className="order-total">
                          <span>Total:</span>
                          <strong>₹{orderTotal}</strong>
                        </div>
                        <button 
                          onClick={() => printOrderReceipt(order)} 
                          className="print-receipt-btn"
                        >
                          Print Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      )}
      </div>
    </div>
  );
};

export default MyOrders;
