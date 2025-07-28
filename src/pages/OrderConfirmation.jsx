import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const state = location?.state || {};

  useEffect(() => {
    // Get order details from localStorage
    const latestOrder = JSON.parse(localStorage.getItem("latestOrder"));
    if (latestOrder) {
      setOrderDetails(latestOrder);
    } else if (state.orderId) {
      // If no latestOrder, use state data
      setOrderDetails(state);
    }
    
    // Calculate estimated delivery (3-5 business days)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 3);
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, [state]);

  if (!orderDetails && !state.orderId) {
    return (
      <div className="order-confirmation-page">
        <div className="order-not-found">
          <div className="error-icon">❌</div>
        <h2>Order Not Found</h2>
          <p>We couldn't find your order details. Please check your order history or contact support.</p>
          <div className="action-buttons">
            <button onClick={() => navigate("/")} className="primary-btn">
              Go to Home
            </button>
            <button onClick={() => navigate("/my-orders")} className="secondary-btn">
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const order = orderDetails || state;
  const { orderId, items = [], total = 0, date, shipping, userEmail, paymentMethod } = order;

  // Determine payment status based on payment method
  const getPaymentStatus = () => {
    if (paymentMethod === "COD") {
      return { status: "Pending", color: "#ffc107", bgColor: "#fff3cd" };
    } else if (paymentMethod === "UPI") {
      return { status: "Paid", color: "#155724", bgColor: "#d4edda" };
    } else if (paymentMethod === "Card") {
      return { status: "Paid", color: "#155724", bgColor: "#d4edda" };
    }
    return { status: "Unknown", color: "#6c757d", bgColor: "#f8f9fa" };
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p className="success-message">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-header">
            <h2>Order Summary</h2>
            <div className="order-id">
              <span>Order ID:</span>
              <strong>{orderId}</strong>
            </div>
          </div>

          <div className="order-details">
            <div className="detail-row">
              <span>Order Date:</span>
              <span>{date || new Date().toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <span className="payment-method">
                {paymentMethod === "COD" ? "Cash on Delivery" : 
                 paymentMethod === "Card" ? "Debit/Credit Card" : 
                 paymentMethod === "UPI" ? "UPI Payment" : 
                 paymentMethod ? paymentMethod : "Unknown"}
              </span>
            </div>
            <div className="detail-row">
              <span>Payment Status:</span>
              <span 
                className="payment-status"
                style={{ 
                  backgroundColor: paymentStatus.bgColor, 
                  color: paymentStatus.color 
                }}
              >
                {paymentStatus.status}
              </span>
            </div>
            <div className="detail-row">
              <span>Estimated Delivery:</span>
              <span>{estimatedDelivery}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {shipping && (
          <div className="shipping-info">
            <h3>Shipping Address</h3>
            <div className="address-details">
              <p><strong>{shipping.name}</strong></p>
              <p>{shipping.address}</p>
              <p>{shipping.city}, {shipping.pincode}</p>
              <p>Phone: {shipping.phone}</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="order-items">
          <h3>Order Items ({items.length})</h3>
          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-card">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">₹{item.price}</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                  <p className="item-total">Total: ₹{item.price * item.quantity}</p>
                </div>
              </div>
        ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="payment-summary">
          <h3>Payment Summary</h3>
          <div className="payment-details">
            <div className="payment-row">
              <span>Subtotal:</span>
              <span>₹{total}</span>
            </div>
            <div className="payment-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="payment-row total-row">
              <span>Total {paymentMethod === "COD" ? "Amount" : "Paid"}:</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-list">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Order Processing</h4>
                <p>We're preparing your order for shipment</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Shipping</h4>
                <p>Your order will be shipped within 24 hours</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Delivery</h4>
                <p>Estimated delivery: {estimatedDelivery}</p>
                {paymentMethod === "COD" && (
                  <p className="cod-note">💳 Payment will be collected upon delivery</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => navigate("/")} className="primary-btn">
            Continue Shopping
          </button>
          <button onClick={() => navigate("/my-orders")} className="secondary-btn">
            View My Orders
          </button>
          <button onClick={() => window.print()} className="print-btn">
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
