import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // ✅ Correct
import Home from "./pages/Home";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Kids from "./pages/Kids";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import ThankYou from "./pages/ThankYou";
import Confirmation from "./pages/Confirmation";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";
import AdminOrders from "./admin/AdminOrders";
import AdminProducts from "./admin/AdminProducts";
import MyOrders from "./pages/MyOrders";
import AdminAllOrders from "./admin/AdminAllOrders";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from './components/PrivateRoute';
import SearchResults from "./pages/SearchResults";
import AdminRoute from './components/AdminRoute';
import DatabaseExample from "./pages/DatabaseExample";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<AdminRoute><Home /></AdminRoute>} />
        <Route path="/men" element={<AdminRoute><Men /></AdminRoute>} />
        <Route path="/women" element={<AdminRoute><Women /></AdminRoute>} />
        <Route path="/kids" element={<AdminRoute><Kids /></AdminRoute>} />
        <Route path="/cart" element={<AdminRoute><Cart /></AdminRoute>} />
        <Route path="/checkout" element={<AdminRoute><Checkout /></AdminRoute>} />
        <Route path="/payment" element={<AdminRoute><Payment /></AdminRoute>} />
        <Route path="/thank-you" element={<AdminRoute><ThankYou /></AdminRoute>} />
        <Route path="/confirmation" element={<AdminRoute><Confirmation /></AdminRoute>} />
        <Route path="/order-confirmation" element={<AdminRoute><OrderConfirmation /></AdminRoute>} />
        <Route path="/order-history" element={<AdminRoute><OrderHistory /></AdminRoute>} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/all-orders" element={<AdminAllOrders />} />
        <Route path="/my-orders" element={<AdminRoute><MyOrders /></AdminRoute>} />
        <Route path="/login" element={<AdminRoute><Login /></AdminRoute>} />
        <Route path="/signup" element={<AdminRoute><Signup /></AdminRoute>} />
        <Route path="/search" element={<AdminRoute><SearchResults /></AdminRoute>} />
        <Route path="/database-example" element={<AdminRoute><DatabaseExample /></AdminRoute>} />
        <Route
          path="/profile"
          element={
            <AdminRoute>
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
