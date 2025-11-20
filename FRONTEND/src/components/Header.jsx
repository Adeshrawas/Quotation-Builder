import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, IndianRupee, FileText, LogOut } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // Go to landing page on logout
  };

  // Base nav items visible for all logged-in users
  const navItems = [
    { name: "Generate Quote", path: "/generate-quotation", icon: FileText },
  ];

  // Only add Manage Rates if user is admin
  if (user?.role === "admin") {
    navItems.push({ name: "Manage Rates", path: "/manage-rates", icon: IndianRupee });
    navItems.push({ name: "Admin", path: "/admin", icon: Settings });
  }

  // 🔥 FIXED — show name instead of email
  const displayName =
    user?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-md">
      <div className="container flex items-center justify-between px-6 py-3 mx-auto">
        {/* Logo */}
        <Link
          to={isLoggedIn ? "/generate-quotation" : "/"}
          className="text-2xl font-extrabold text-indigo-700 transition hover:text-indigo-900"
        >
          QuoteBuilder PRO
        </Link>

        {/* Navigation */}
        {isLoggedIn && (
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-3 py-2 font-medium text-gray-700 transition-all rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            ))}

            {/* Welcome message */}
            <span className="flex items-center px-3 py-2 font-medium text-gray-600 rounded-lg bg-gray-50">
              Welcome{" "}
              <span className="ml-1 text-indigo-600">
                {displayName}
              </span>
            </span>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-white transition-all bg-red-600 rounded-lg shadow-md hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
