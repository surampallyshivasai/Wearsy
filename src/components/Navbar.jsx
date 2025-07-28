import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // Make sure this is correctly imported
import { useEffect, useState, useRef } from "react";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart(); // get cart items from context
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const adminMenuRef = useRef(null);

  const checkAdminStatus = () => {
    const adminStatus = localStorage.getItem("isAdminAuthenticated");
    setIsAdmin(adminStatus === "true");
  };

  useEffect(() => {
    checkAdminStatus();
    // Listen for storage changes (when admin logs in/out from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "isAdminAuthenticated") {
        checkAdminStatus();
      }
    };
    // Check admin status periodically to catch any missed updates
    const interval = setInterval(checkAdminStatus, 1000);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    };

    if (showAdminMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdminMenu]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    setIsAdmin(false);
    navigate("/");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setChangePasswordError("");
    if (newPassword.length < 4) {
      setChangePasswordError("Password must be at least 4 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError("Passwords do not match");
      return;
    }
    localStorage.setItem("adminPassword", newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePassword(false);
    setChangePasswordError("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If admin is logged in, show minimal navbar with only admin mode dropdown
  if (isAdmin) {
    return (
      <nav className="navbar">
        <div className="navbar-left">
          <span className="nav-logo">Admin Mode</span>
        </div>
        <div className="navbar-right" ref={adminMenuRef}>
          <button
            className="admin-mode-btn"
            style={{ background: '#23272f', color: '#00d4ff', padding: '8px 18px', borderRadius: 7, fontWeight: 600 }}
            onClick={() => setShowAdminMenu((v) => !v)}
          >
            Admin
          </button>
          {showAdminMenu && (
            <div style={{ position: 'absolute', right: 24, top: 60, background: '#23272f', border: '1px solid #00d4ff', borderRadius: 8, zIndex: 10, minWidth: 180, boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
              <button
                style={{ width: '100%', background: 'none', color: '#00d4ff', border: 'none', padding: '12px 0', fontWeight: 600, cursor: 'pointer', borderBottom: '1px solid #222' }}
                onClick={() => { setShowChangePassword(true); setShowAdminMenu(false); }}
              >
                Change Password
              </button>
              <button
                style={{ width: '100%', background: 'none', color: '#ff4d4f', border: 'none', padding: '12px 0', fontWeight: 600, cursor: 'pointer' }}
                onClick={handleAdminLogout}
              >
                Logout
              </button>
            </div>
          )}
          {showChangePassword && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Change Admin Password</h3>
                <form onSubmit={handleChangePassword}>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  {changePasswordError && (
                    <div style={{color: '#ff4d4f', fontSize: '14px', marginTop: '10px'}}>
                      {changePasswordError}
                    </div>
                  )}
                  <div className="modal-actions">
                    <button type="submit">Change Password</button>
                    <button 
                      type="button" 
                      className="cancel" 
                      onClick={() => {
                        setShowChangePassword(false);
                        setNewPassword("");
                        setConfirmPassword("");
                        setChangePasswordError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-logo">Home</Link>
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            name="search" 
            placeholder="Search products, categories..." 
            autoComplete="off"
          />
          <button type="submit" title="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </form>
      </div>

      <div className="navbar-right">
        {currentUser && (
          <span className="welcome-msg">Welcome, {currentUser.name || currentUser.email.split("@")[0]}</span>
        )}
        {currentUser ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/cart">Cart ({totalItems})</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
