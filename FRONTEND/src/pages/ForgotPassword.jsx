import React, { useState, useEffect } from "react";
import axios from "axios";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensures background color covers the entire screen
    document.body.className = "bg-gray-100";
  }, []);

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
    /* FIXED: Page background now bg-gray-100 */
    <div className="flex items-center justify-center min-h-screen px-6 font-sans bg-gray-100">
      {notify && (
        <Notification
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}

      <div className="w-full max-w-md p-10 bg-white border border-gray-200 shadow-2xl rounded-[2.5rem] transition-all duration-300 hover:scale-[1.01]">

        <button
          onClick={() => navigate("/login")}
          /* FIXED: Updated "Back" button to match Admin secondary style */
          className="flex items-center gap-2 px-4 py-2 mb-6 font-bold text-teal-900 transition-all border border-gray-200 shadow-sm rounded-xl bg-gray-50 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h2 className="mb-2 text-3xl font-black text-center text-teal-900">
          Forgot Password
        </h2>
        <p className="mb-8 text-sm text-center text-gray-500">
          Enter your email to receive a verification code.
        </p>

        <div className="flex flex-col gap-1 mb-6">
          <label className="ml-1 text-xs font-bold tracking-wider text-teal-900 uppercase">Gmail Address</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            /* FIXED: Ring color updated to match requested green accent */
            className="w-full p-4 text-gray-800 transition-all bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06d6a0]"
          />
        </div>

        <button
          onClick={handleSendOtp}
          /* FIXED: Primary button uses bg-[#06d6a0] and hover:bg-[#05bc8c] */
          className="w-full py-4 bg-[#06d6a0] text-white rounded-2xl font-black shadow-lg hover:bg-[#05bc8c] hover:scale-[1.02] active:scale-[0.97] transition-all uppercase tracking-wide"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;