import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import GenerateQuotation from "./pages/GenerateQuotation";
import ManageRates from "./pages/ManageRates";
import Landing from "./pages/Landing";
import Logout from "./pages/Logout";

import { RateProvider } from "./context/RateContext";
import { QuoteProvider } from "./context/QuoteContext"; // ✅ Import QuoteContext

// Helper function to safely get user role from localStorage
const getRole = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user).role;
    }
    return null;
  } catch (e) {
    console.error("Error parsing user role from localStorage", e);
    return null;
  }
};

// PrivateRoute component for authentication & role-based access
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const userRole = getRole();

  if (!token) {
    // User not logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // User does not have required role
    alert("Access Denied: You do not have the required permissions.");
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <RateProvider>
      <QuoteProvider> {/* ✅ Wrap app with QuoteProvider for persistent quotation data */}
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />

            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="admin">
                  <Admin />
                </PrivateRoute>
              }
            />

            <Route
              path="/generate-quotation"
              element={
                <PrivateRoute>
                  <GenerateQuotation />
                </PrivateRoute>
              }
            />

            <Route
              path="/manage-rates"
              element={
                <PrivateRoute>
                  <ManageRates />
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
