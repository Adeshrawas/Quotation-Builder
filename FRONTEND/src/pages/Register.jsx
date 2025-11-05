import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Role state
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
      await axios.post("http://localhost:5000/api/auth/register", { email, password, role });
      alert("Registered successfully! You can now login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="relative w-[420px] p-10 bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* Decorative Gradient */}
        <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute w-56 h-56 rounded-full -bottom-16 -left-16 bg-gradient-to-bl from-indigo-400 to-blue-500 opacity-20 blur-3xl"></div>

        <h2 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">Register</h2>

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 mb-4 text-gray-800 placeholder-gray-400 transition-all duration-200 border-2 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 mb-4 text-gray-800 placeholder-gray-400 transition-all duration-200 border-2 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            required
          />

          {/* Role Selection */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-4 mb-6 text-gray-800 transition-all duration-200 border-2 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transform transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-60"
          >
            Register
          </button>

          <p className="mt-4 text-sm text-center text-gray-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 cursor-pointer hover:underline hover:text-indigo-700"
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
