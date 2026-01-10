import React, { useState } from "react";
import axios from "axios";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(null);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });

      setNotify({ type: "success", message: "OTP sent to your Gmail!" });

      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 1000);

    } catch (err) {
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Failed to send OTP",
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
          onClick={() => navigate("/login")}
          className="px-4 py-2 mb-6 text-indigo-600 transition-all border border-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-105"
        >
          ← Back
        </button>

        <h2 className="mb-6 text-3xl font-extrabold text-center text-indigo-700">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your Gmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-5 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleSendOtp}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.97] transition-all"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
