import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, IndianRupee, FileText, LogOut } from "lucide-react";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [adminLogo, setAdminLogo] = useState(null);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchAdminLogo = async () => {
      try {
        if (user && user.role === "user" && user.adminId) {
          const res = await axios.get(`http://localhost:5000/api/auth/admin-logo/${user.adminId}`);
          const logoUrl = res.data.logoUrl;
          if (logoUrl) setAdminLogo(`http://localhost:5000${logoUrl}`);
        } else if (user && user.role === "admin" && user.logoUrl) {
          setAdminLogo(`http://localhost:5000${user.logoUrl}`);
        } else {
          setAdminLogo(null);
        }
      } catch (err) {
        setAdminLogo(null);
      }
    };

    fetchAdminLogo();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [{ name: "Generate Quote", path: "/generate-quotation", icon: FileText }];

  if (user?.role === "admin") {
    navItems.push({ name: "Manage Rates", path: "/manage-rates", icon: IndianRupee });
    navItems.push({ name: "Admin", path: "/admin", icon: Settings });
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-md">
      <div className="container flex items-center justify-between px-6 py-3 mx-auto">

        {/* Logo */}
        <Link to={isLoggedIn ? "/generate-quotation" : "/"} className="flex items-center gap-3">
          {adminLogo ? (
            <img
              src={adminLogo}
              alt="logo"
              className="object-contain w-40 h-16 rounded-md"  // ⬅ WIDTH INCREASED
            />
          ) : (
            <span className="text-2xl font-extrabold text-indigo-700 transition hover:text-indigo-900">
              Quotation System
            </span>
          )}
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

            <span className="flex items-center px-3 py-2 font-medium text-gray-600 rounded-lg bg-gray-50">
              Welcome <span className="ml-1 text-indigo-600">{displayName}</span>
            </span>

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
