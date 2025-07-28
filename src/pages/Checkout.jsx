import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    address: "",
    phone: "",
    city: "",
    pincode: ""
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load saved addresses for current user
  useEffect(() => {
    if (currentUser?.email) {
      const userAddresses = JSON.parse(localStorage.getItem(`addresses_${currentUser.email}`)) || [];
      setSavedAddresses(userAddresses);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow 10 digits
    if (name === 'phone') {
      const phoneRegex = /^\d{0,10}$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid
      }
    }
    
    // Pincode validation - only allow 6 digits
    if (name === 'pincode') {
      const pincodeRegex = /^\d{0,6}$/;
      if (!pincodeRegex.test(value)) {
        return; // Don't update if invalid
      }
    }
    
    setShippingDetails({
      ...shippingDetails,
      [name]: value
    });
  };

  const saveCurrentAddress = () => {
    if (!currentUser?.email) return;
    
    // Check if all fields are filled
    if (!shippingDetails.name || !shippingDetails.address || !shippingDetails.phone || !shippingDetails.city || !shippingDetails.pincode) {
      alert("Please fill all address fields before saving");
      return;
    }
    
    // Validate phone number (must be exactly 10 digits)
    if (shippingDetails.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    
    // Validate pincode (must be exactly 6 digits)
    if (shippingDetails.pincode.length !== 6) {
      alert("Pincode must be exactly 6 digits");
      return;
    }

    // Check if address already exists
    const addressExists = savedAddresses.some(addr => 
      addr.name === shippingDetails.name &&
      addr.address === shippingDetails.address &&
      addr.phone === shippingDetails.phone &&
      addr.city === shippingDetails.city &&
      addr.pincode === shippingDetails.pincode
    );

    if (addressExists) {
      alert("This address is already saved");
      return;
    }

    // Add timestamp to address
    const addressToSave = {
      ...shippingDetails,
      id: Date.now(),
      savedAt: new Date().toLocaleString()
    };

    const updatedAddresses = [...savedAddresses, addressToSave];
    setSavedAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${currentUser.email}`, JSON.stringify(updatedAddresses));
    alert("Address saved successfully!");
  };

  const useSavedAddress = (address) => {
    setShippingDetails({
      name: address.name,
      address: address.address,
      phone: address.phone,
      city: address.city,
      pincode: address.pincode
    });
    setShowSavedAddresses(false);
  };

  const deleteSavedAddress = (addressId) => {
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
    setSavedAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${currentUser.email}`, JSON.stringify(updatedAddresses));
  };

  const handleConfirmOrder = () => {
    // Validate phone number (must be exactly 10 digits)
    if (shippingDetails.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    
    // Validate pincode (must be exactly 6 digits)
    if (shippingDetails.pincode.length !== 6) {
      alert("Pincode must be exactly 6 digits");
      return;
    }
    
    const orderId = "ORDER" + Date.now();
    const currentTime = new Date().toISOString(); // Use ISO string for better date handling
    
    const orderDetails = {
      id: orderId,
      items: cartItems,
      total,
      date: currentTime,
      orderDate: currentTime, // Add both date and orderDate for compatibility
      userEmail: currentUser?.email || "guest",
      shipping: shippingDetails
    };

    // Save order details to localStorage
    localStorage.setItem("latestOrder", JSON.stringify(orderDetails));
    const existingOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    existingOrders.push(orderDetails);
    localStorage.setItem("allOrders", JSON.stringify(existingOrders));

    const history = JSON.parse(localStorage.getItem("orderHistory")) || [];
    history.push(orderDetails);
    localStorage.setItem("orderHistory", JSON.stringify(history));

    // Clear cart and go to /payment page
    clearCart();
    navigate("/payment");
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      
      {/* Saved Addresses Section */}
      {savedAddresses.length > 0 && (
        <div className="saved-addresses-section">
          <button 
            className="toggle-saved-addresses"
            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
          >
            {showSavedAddresses ? "Hide" : "Show"} Saved Addresses ({savedAddresses.length})
          </button>
          
          {showSavedAddresses && (
            <div className="saved-addresses-list">
              <h3>Previously Used Addresses</h3>
              {savedAddresses.map((address) => (
                <div key={address.id} className="saved-address-item">
                  <div className="address-info">
                    <p><strong>{address.name}</strong></p>
                    <p>{address.address}</p>
                    <p>{address.city}, {address.pincode}</p>
                    <p>Phone: {address.phone}</p>
                    <p className="saved-date">Saved: {address.savedAt}</p>
                  </div>
                  <div className="address-actions">
                    <button 
                      className="use-address-btn"
                      onClick={() => useSavedAddress(address)}
                    >
                      Use This Address
                    </button>
                    <button 
                      className="delete-address-btn"
                      onClick={() => deleteSavedAddress(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form className="shipping-form">
        <input type="text" name="name" placeholder="Full Name" value={shippingDetails.name} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={shippingDetails.address} onChange={handleChange} required />
        <input 
          type="text" 
          name="phone" 
          placeholder="Phone Number (10 digits)" 
          value={shippingDetails.phone} 
          onChange={handleChange} 
          maxLength="10"
          required 
        />
        <input type="text" name="city" placeholder="City" value={shippingDetails.city} onChange={handleChange} required />
        <input 
          type="text" 
          name="pincode" 
          placeholder="Pincode (6 digits)" 
          value={shippingDetails.pincode} 
          onChange={handleChange} 
          maxLength="6"
          required 
        />
      </form>

      <div className="checkout-actions">
        <button className="save-address-btn" onClick={saveCurrentAddress}>
          Save This Address
        </button>
        <button className="confirm-order-btn" onClick={handleConfirmOrder}>
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
