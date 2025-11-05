import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Disable scroll for this page
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
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/generate-quotation");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="relative w-full max-w-md p-10 overflow-hidden bg-white shadow-2xl rounded-3xl">
        {/* Decorative Gradient Circles */}
        <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute w-56 h-56 rounded-full -bottom-16 -left-16 bg-gradient-to-bl from-indigo-400 to-blue-500 opacity-20 blur-3xl"></div>

        <form onSubmit={handleSubmit}>
          <h2 className="mb-6 text-3xl font-extrabold text-center text-indigo-700">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 text-gray-800 placeholder-gray-400 transition-all duration-200 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 text-gray-800 placeholder-gray-400 transition-all duration-200 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />

          <button
            type="submit"
            className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-60"
          >
            Login
          </button>

          <p className="mt-4 text-sm text-center text-gray-500">
            Welcome back! Please enter your credentials to continue.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
