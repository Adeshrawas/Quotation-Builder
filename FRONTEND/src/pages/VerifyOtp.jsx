import React, { useState } from "react";
import axios from "axios";
import Notification from "../components/Notification";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [notify, setNotify] = useState(null);
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });

      setNotify({ type: "success", message: "OTP verified!" });

      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 800);

    } catch (err) {
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Invalid OTP",
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

      <div className="w-full max-w-md p-10 bg-white border border-gray-200 shadow-2xl rounded-[2.5rem]">
        
        <button
          onClick={() => navigate("/forgot-password")}
          className="px-4 py-2 mb-6 font-bold text-teal-900 transition-all border border-teal-900 rounded-xl hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 mb-4 bg-gray-50 rounded-full text-[#06d6a0]">
             <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-teal-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-center text-gray-500">
            Sent to <span className="font-bold text-teal-900">{email}</span>
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          maxLength={6}
          // Logic: Only allow digits
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full p-4 mb-5 text-center text-2xl tracking-[0.5em] font-bold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#06d6a0]"
        />

        <button
          onClick={handleVerify}
          className="w-full py-3 bg-teal-900 text-white rounded-xl font-bold text-lg hover:bg-teal-800 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-md"
        >
          Verify OTP
        </button>

        <p className="mt-6 text-sm text-center text-gray-400">
          Didn't receive the code?{" "}
          <span 
            className="font-bold text-teal-900 cursor-pointer hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Resend
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;