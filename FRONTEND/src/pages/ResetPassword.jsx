import React, { useState } from "react";
import axios from "axios";
import Notification from "../components/Notification";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [notify, setNotify] = useState(null);
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        password,
      });

      setNotify({ type: "success", message: "Password reset successful!" });

      setTimeout(() => navigate("/login"), 1000);

    } catch (err) {
      setNotify({
        type: "error",
        message: "Failed to reset password",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {notify && (
        <Notification
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}

      <div className="w-full max-w-md p-10 bg-white border border-gray-200 shadow-2xl rounded-3xl">

        <button
          onClick={() => navigate("/verify-otp")}
          className="px-4 py-2 mb-6 text-indigo-600 transition-all border border-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-105"
        >
          ← Back
        </button>

        <h2 className="mb-6 text-3xl font-extrabold text-center text-indigo-700">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-5 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleReset}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.97] transition-all"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
