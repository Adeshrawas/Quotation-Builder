import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, IndianRupee, FileText, LogOut } from "lucide-react";
import axios from "axios";

const HEADER_HEIGHT = "96px"; // 🔥 must match header height

const Header = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [adminLogo, setAdminLogo] = useState(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchAdminLogo = async () => {
      try {
        if (!token || !user) return;

        if (user.role === "user" && user.adminId) {
          const res = await axios.get(
            `http://localhost:5000/api/auth/admin-logo/${user.adminId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data.logoBase64) setAdminLogo(res.data.logoBase64);
        } else if (user.role === "admin" && user.logoBase64) {
          setAdminLogo(user.logoBase64);
        }
      } catch {
        setAdminLogo(null);
      }
    };

    fetchAdminLogo();
  }, [user, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { name: "Generate Quote", path: "/generate-quotation", icon: FileText },
  ];

  if (user?.role === "admin") {
    navItems.push(
      { name: "Manage Rates", path: "/admin/manage-rates", icon: IndianRupee },
      { name: "Admin", path: "/admin", icon: Settings }
    );
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* 🔥 FIXED HEADER - SHADOWS REMOVED */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 rounded-b-[2.5rem]"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="container flex items-center justify-between h-full px-8 mx-auto">
          <Link to="/generate-quotation" className="flex items-center gap-4">
            {adminLogo ? (
              <img
                src={adminLogo}
                alt="logo"
                className="object-contain h-14 max-w-[220px]"
              />
            ) : (
              <span className="text-3xl font-extrabold text-teal-900">
                Quotation System
              </span>
            )}
          </Link>

          {isLoggedIn && (
            <nav className="flex items-center gap-4 md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-5 py-3 font-semibold text-teal-900 transition-colors rounded-2xl hover:bg-gray-100"
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              ))}

              <div className="items-center hidden px-5 py-3 text-teal-900 bg-gray-100 border border-gray-200 sm:flex rounded-2xl">
                Welcome <b className="ml-1">{displayName}</b>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 text-white transition-colors bg-teal-900 rounded-2xl hover:bg-teal-800"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* 🔥 SPACER */}
      <div style={{ height: HEADER_HEIGHT }} className="bg-gray-100" />
    </>
  );
};

export default Header;