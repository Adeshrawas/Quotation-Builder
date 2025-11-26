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

import Notify from "./components/Notification";   // ⭐ NEW

import React, { useState } from "react";

// Helper function to safely get user role from localStorage
const getRole = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) return JSON.parse(user).role;
    return null;
  } catch (e) {
    console.error("Error parsing user role from localStorage", e);
    return null;
  }
};

function App() {
  const [notify, setNotify] = useState(null);

  // PrivateRoute for auth & role
  const PrivateRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem("token");
    const userRole = getRole();

    if (!token) return <Navigate to="/login" replace />;

    if (requiredRole && userRole !== requiredRole) {
      setNotify({ type: "error", message: "Access Denied: You do not have the required permissions." }); // ⭐ Replaced alert
      return <Navigate to="/" replace />;
    }

    return children;
  };

  // Layout wrapper for pages that need Header
  const WithHeader = ({ children }) => (
    <div>
      <Header />
      {children}
    </div>
  );

  return (
    <RateProvider>
      <QuoteProvider>

        {/* ⭐ Notification display */}
        {notify && (
          <Notify
            type={notify.type}
            message={notify.message}
            onClose={() => setNotify(null)}
          />
        )}

        <Router>
          <Routes>
            {/* Pages without Header */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin/add-user"
              element={
                <PrivateRoute requiredRole="admin">
                  <AddUser />
                </PrivateRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />

            {/* Pages with Header */}
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
            <Route
              path="/manage-rates"
              element={
                <PrivateRoute>
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
