import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Notify from "../components/Notification";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notify, setNotify] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      login();
      setNotify({ type: "success", message: "Login successful!" });

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/generate-quotation");
      }, 800);
    } catch (err) {
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Login failed",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gray-100">
      {notify && (
        <Notify
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}

      <div className="relative w-full max-w-md p-10 overflow-hidden transition bg-white border border-gray-200 shadow-2xl rounded-3xl">

        <div className="absolute w-56 h-56 bg-teal-900 rounded-full -top-20 -right-20 opacity-10 blur-3xl"></div>
        <div className="absolute w-56 h-56 bg-teal-800 rounded-full -bottom-20 -left-20 opacity-10 blur-3xl"></div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <h2 className="mb-8 text-3xl font-extrabold text-center text-teal-900">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-teal-900"
            required
          />

          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-teal-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-teal-900 right-3 top-3"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="mb-6 text-sm text-teal-900 hover:underline"
          >
            Forgot Password?
          </button>

          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition-colors bg-teal-900 rounded-xl hover:bg-teal-800"
          >
            Login
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="font-semibold text-teal-900 cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;