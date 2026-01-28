import React, { useState } from "react";
import axios from "axios";
import Notification from "../components/Notification";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex items-center justify-center min-h-screen px-6 bg-gray-100">
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
          className="px-4 py-2 mb-6 text-teal-900 transition-all border border-teal-900 rounded-xl hover:bg-gray-50 hover:scale-105"
        >
          ← Back
        </button>

        <h2 className="mb-6 text-3xl font-extrabold text-center text-teal-900">
          Reset Password
        </h2>

        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#06d6a0]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute text-gray-400 right-4 top-4 hover:text-teal-900"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 bg-teal-900 text-white rounded-xl font-semibold hover:bg-teal-800 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-md"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;