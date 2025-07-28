import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Handle expiry date formatting (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 4 digits
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    // Add "/" after month (2 digits)
    if (value.length >= 2) {
      const month = value.slice(0, 2);
      const year = value.slice(2);
      
      // Validate month (01-12)
      const monthNum = parseInt(month);
      if (monthNum < 1 || monthNum > 12) {
        return; // Don't update if invalid month
      }
      
      value = month + "/" + year;
    }
    
    setExpiry(value);
  };

  // Validate expiry date
  const validateExpiry = (expiryValue) => {
    if (!expiryValue || expiryValue.length !== 5) return false;
    
    const [month, year] = expiryValue.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
    const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
    
    // Check if month is valid (01-12)
    if (monthNum < 1 || monthNum > 12) return false;
    
    // Check if year is valid (current year or future)
    if (yearNum < currentYear) return false;
    
    // If same year, check if month is not in the past
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  const handlePayment = () => {
    if (!selectedOption) {
      alert("Please select a payment option.");
      return;
    }

    if (selectedOption === "UPI" && upiId.trim() === "") {
      alert("Please enter a valid UPI ID.");
      return;
    }

    if (selectedOption === "Card") {
      if (
        cardNumber.trim().length !== 16 ||
        !validateExpiry(expiry) ||
        cvv.trim().length !== 3
      ) {
        alert("Please fill in all valid card details. Expiry should be in MM/YY format.");
        return;
      }
    }

    const orderId = "ORDER" + Date.now();
    const currentTime = new Date().toISOString(); // Use ISO string for better date handling
    
    // Get shipping information from the latest order (saved in checkout)
    const latestOrder = JSON.parse(localStorage.getItem("latestOrder"));
    const shippingInfo = latestOrder?.shipping || null;
    
    // Create complete order details
    const orderDetails = {
      id: orderId,
      orderId: orderId,
      items: cartItems,
      total,
      date: currentTime,
      orderDate: currentTime,
      userEmail: JSON.parse(localStorage.getItem("currentUser"))?.email || "guest",
      paymentMethod: selectedOption,
      shipping: shippingInfo
    };
    
    // Update latestOrder with payment information
    localStorage.setItem("latestOrder", JSON.stringify(orderDetails));
    
    // Save to all orders
    const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
    allOrders.push(orderDetails);
    localStorage.setItem("orders", JSON.stringify(allOrders));
    
    // Save to order history
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    orderHistory.push(orderDetails);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
    
    // Save to allOrders (for My Orders page)
    const allOrdersForMyOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    allOrdersForMyOrders.push(orderDetails);
    localStorage.setItem("allOrders", JSON.stringify(allOrdersForMyOrders));
    
    localStorage.removeItem("cart");

    navigate("/order-confirmation", { state: { orderId, cartItems, total, paymentMethod: selectedOption, date: currentTime, shipping: shippingInfo } });
  };

  return (
    <div className="payment-page">
      <h2>Choose Payment Method</h2>

      <div className="payment-options">
        {["UPI", "Card", "COD"].map((method) => (
          <label
            key={method}
            className={`payment-option ${selectedOption === method ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="payment"
              value={method}
              onChange={() => setSelectedOption(method)}
            />
            {method === "COD" ? "Cash on Delivery" : method === "Card" ? "Debit/Credit Card" : "UPI"}
          </label>
        ))}
      </div>

      {selectedOption === "UPI" && (
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter UPI ID (e.g. user@upi)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
        </div>
      )}

      {selectedOption === "Card" && (
        <div className="input-section">
          <input
            type="text"
            placeholder="Card Number (16 digits)"
            maxLength="16"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
          />
          <input
            type="text"
            placeholder="Expiry (MM/YY)"
            maxLength="5"
            value={expiry}
            onChange={handleExpiryChange}
            className={expiry && !validateExpiry(expiry) ? "invalid" : ""}
          />
          <input
            type="password"
            placeholder="CVV"
            maxLength="3"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      )}

      <button onClick={handlePayment} className="pay-now-btn">
        {total > 0 ? `Pay Now ₹${total}` : "Pay Now"}
      </button>
    </div>
  );
};

export default Payment;
