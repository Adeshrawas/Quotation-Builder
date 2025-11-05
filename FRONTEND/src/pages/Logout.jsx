import React, { useEffect } from "react";
import { logoutUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    logoutUser();
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white bg-gray-900">
      <h2>Logging out...</h2>
    </div>
  );
}
