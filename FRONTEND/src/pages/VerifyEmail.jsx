import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const { userId, choice } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/verify-email/${userId}/${choice}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed or link expired.");
      });
  }, [userId, choice]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gray-100">
      <div className="w-full max-w-md p-10 text-center bg-white shadow-2xl rounded-[2.5rem] border border-gray-100">
        
        <div className="flex justify-center mb-6">
          {status === "loading" && (
            <Loader2 className="w-16 h-16 text-teal-800 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle className="w-16 h-16 text-teal-800" />
          )}
          {status === "error" && (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>

        <h1 className="mb-4 text-3xl font-extrabold text-teal-900">
          {status === "loading" ? "Please Wait" : status === "success" ? "Verified!" : "Oops!"}
        </h1>

        <p className="mb-8 font-medium text-gray-500">
          {message}
        </p>

        {status !== "loading" && (
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 font-bold text-white transition-all bg-teal-900 shadow-md rounded-xl hover:bg-teal-800 active:scale-95"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;