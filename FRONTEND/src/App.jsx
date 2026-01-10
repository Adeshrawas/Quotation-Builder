import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AddUser from "./pages/AddUser";
import GenerateQuotation from "./pages/GenerateQuotation";
import ManageRates from "./pages/ManageRates";
import Landing from "./pages/Landing";
import Logout from "./pages/Logout";

import { RateProvider } from "./context/RateContext";
import { QuoteProvider } from "./context/QuoteContext";

import Notify from "./components/Notification";

import React, { useState } from "react";

import EditUser from "./pages/EditUser";

// ⭐ NEW MESSAGE PAGE
import AdminMessages from "./pages/AdminMessages";

// ⭐⭐ FORGOT PASSWORD SYSTEM PAGES
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";

// ⭐⭐ EMAIL VERIFICATION PAGE (NEW)
import VerifyEmail from "./pages/VerifyEmail";

// Read role safely
const getRole = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) return JSON.parse(user).role;
    return null;
  } catch {
    return null;
  }
};

function App() {
  const [notify, setNotify] = useState(null);

  const PrivateRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem("token");
    const userRole = getRole();

    if (!token) return <Navigate to="/login" replace />;

    if (requiredRole && userRole !== requiredRole) {
      setNotify({
        type: "error",
        message: "Access Denied: You do not have permission.",
      });
      return <Navigate to="/" replace />;
    }

    return children;
  };

  const WithHeader = ({ children }) => (
    <div>
      <Header />
      {children}
    </div>
  );

  return (
    <RateProvider>
      <QuoteProvider>
        {notify && (
          <Notify
            type={notify.type}
            message={notify.message}
            onClose={() => setNotify(null)}
          />
        )}

        <Router>
          <Routes>

            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />

            {/* ⭐⭐ EMAIL VERIFICATION ROUTE (UPDATED) */}
            <Route path="/verify-email/:userId/:choice" element={<VerifyEmail />} />

            {/* ⭐⭐ FORGOT PASSWORD ROUTES */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Add User */}
            <Route
              path="/admin/add-user"
              element={
                <PrivateRoute requiredRole="admin">
                  <AddUser />
                </PrivateRoute>
              }
            />

            {/* Admin Panel */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="admin">
                  <WithHeader>
                    <Admin />
                  </WithHeader>
                </PrivateRoute>
              }
            />

            {/* Edit User */}
            <Route
              path="/admin/edit/:id"
              element={
                <PrivateRoute requiredRole="admin">
                  <WithHeader>
                    <EditUser />
                  </WithHeader>
                </PrivateRoute>
              }
            />

            {/* ⭐ NEW ADMIN MESSAGES PAGE */}
            <Route
              path="/admin/messages"
              element={
                <PrivateRoute requiredRole="admin">
                  <WithHeader>
                    <AdminMessages />
                  </WithHeader>
                </PrivateRoute>
              }
            />

            {/* Quotation Page */}
            <Route
              path="/generate-quotation"
              element={
                <PrivateRoute>
                  <WithHeader>
                    <GenerateQuotation />
                  </WithHeader>
                </PrivateRoute>
              }
            />

            {/* Manage Rates */}
            <Route
              path="/manage-rates"
              element={
                <PrivateRoute requiredRole="admin">
                  <WithHeader>
                    <ManageRates />
                  </WithHeader>
                </PrivateRoute>
              }
            />

          </Routes>
        </Router>
      </QuoteProvider>
    </RateProvider>
  );
}

export default App;
