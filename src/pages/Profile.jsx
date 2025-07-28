/**
 * Profile.jsx with add/edit address functionality in Saved Addresses section
 */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const emptyAddress = {
  name: "",
  address: "",
  phone: "",
  city: "",
  pincode: ""
};

const Profile = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("profile");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null for add, address object for edit
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (currentUser?.email) {
      const userAddresses = JSON.parse(localStorage.getItem(`addresses_${currentUser.email}`)) || [];
      setSavedAddresses(userAddresses);
    }
    if (currentUser?.name) {
      setNameInput(currentUser.name);
    }
  }, [currentUser]);

  const handleAddressFormChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({ ...address });
    setShowAddressForm(true);
  };

  const handleAddressFormSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.address || !addressForm.phone || !addressForm.city || !addressForm.pincode) {
      alert("Please fill all address fields");
        return;
      }
    let updatedAddresses;
    if (editingAddress) {
      // Edit existing
      updatedAddresses = savedAddresses.map(addr =>
        addr.id === editingAddress.id ? { ...addressForm, id: editingAddress.id, savedAt: editingAddress.savedAt } : addr
      );
    } else {
      // Add new
      const newAddress = {
        ...addressForm,
        id: Date.now(),
        savedAt: new Date().toLocaleString()
      };
      updatedAddresses = [...savedAddresses, newAddress];
    }
    setSavedAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${currentUser.email}` , JSON.stringify(updatedAddresses));
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm(emptyAddress);
  };

  const handleDeleteAddress = (addressId) => {
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
    setSavedAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${currentUser.email}`, JSON.stringify(updatedAddresses));
  };

  const handleNameEdit = () => {
    setEditingName(true);
    setNameInput(currentUser.name || "");
  };
  const handleNameSave = () => {
    if (!nameInput.trim()) return;
    // Save to localStorage (simulate user update)
    const updatedUser = { ...currentUser, name: nameInput.trim() };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setEditingName(false);
    window.location.reload(); // To update context (or use context update if available)
  };

  if (loading) return <p>Loading...</p>;
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const renderSection = () => {
    if (selected === "profile") {
      return (
        <div className="profile-section">
          <h3>My Profile</h3>
          <div className="profile-edit-row">
            <span><strong>Name:</strong></span>
            {editingName ? (
              <>
                <input
                  className="profile-edit-input"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  autoFocus
                />
                <button className="profile-link-btn" onClick={handleNameSave}>Save</button>
                <button className="profile-link-btn cancel" onClick={() => setEditingName(false)}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{marginLeft: 8}}>{currentUser.name || "-"}</span>
                <button className="profile-link-btn edit" style={{marginLeft: 10}} onClick={handleNameEdit}>Edit</button>
              </>
            )}
          </div>
          <p><strong>Email:</strong> {currentUser.email}</p>
        </div>
      );
    }
    if (selected === "addresses") {
      return (
        <div className="profile-section">
          <h3>Saved Addresses</h3>
          <button className="profile-link-btn" onClick={handleAddAddress} style={{marginBottom: 12}}>Add Address</button>
          {showAddressForm && (
            <form className="profile-address-form" onSubmit={handleAddressFormSubmit}>
              <input name="name" placeholder="Full Name" value={addressForm.name} onChange={handleAddressFormChange} required />
              <input name="address" placeholder="Address" value={addressForm.address} onChange={handleAddressFormChange} required />
              <input name="phone" placeholder="Phone Number" value={addressForm.phone} onChange={handleAddressFormChange} required />
              <input name="city" placeholder="City" value={addressForm.city} onChange={handleAddressFormChange} required />
              <input name="pincode" placeholder="Pincode" value={addressForm.pincode} onChange={handleAddressFormChange} required />
              <div className="profile-address-form-actions">
                <button type="submit" className="profile-link-btn">{editingAddress ? "Save Changes" : "Add Address"}</button>
                <button type="button" className="profile-link-btn cancel" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}>Cancel</button>
              </div>
            </form>
          )}
          {savedAddresses.length === 0 ? (
            <p>No saved addresses found.</p>
          ) : (
            <div className="profile-address-list">
              {savedAddresses.map((address) => (
                <div key={address.id} className="profile-address-item">
                  <div className="profile-address-info">
                    <p><strong>{address.name}</strong></p>
                    <p>{address.address}</p>
                    <p>{address.city}, {address.pincode}</p>
                    <p>Phone: {address.phone}</p>
                    <p className="saved-date">Saved: {address.savedAt}</p>
                  </div>
                  <div className="profile-address-actions">
                    <button className="profile-link-btn edit" onClick={() => handleEditAddress(address)}>Edit</button>
                    <button className="profile-link-btn delete" onClick={() => handleDeleteAddress(address.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (selected === "orders") {
      return (
        <div className="profile-section">
          <h3>My Orders</h3>
          <button className="profile-link-btn" onClick={() => navigate("/my-orders")}>View All Orders</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">{currentUser.name ? currentUser.name[0].toUpperCase() : "U"}</div>
        <div>
          <div className="profile-name">{currentUser.name || "User"}</div>
          <div className="profile-email">{currentUser.email}</div>
        </div>
      </div>
      <div className="profile-dropdown">
        <button className={selected === "profile" ? "active" : ""} onClick={() => setSelected("profile")}>My Profile</button>
        <button className={selected === "addresses" ? "active" : ""} onClick={() => setSelected("addresses")}>Saved Addresses</button>
        <button className={selected === "orders" ? "active" : ""} onClick={() => setSelected("orders")}>My Orders</button>
      </div>
      <div className="profile-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default Profile;
