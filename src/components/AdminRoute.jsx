import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminAuthenticated");
    if (isAdmin === "true") {
      navigate("/admin");
    }
  }, [navigate]);

  return children;
};

export default AdminRoute; 