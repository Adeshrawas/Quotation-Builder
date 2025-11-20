import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const AddUser = () => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
  });

  const navigate = useNavigate();

  // Disable scroll on this page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Phone validation (exact 10 digits)
    if (!/^\d{10}$/.test(newUser.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    // Email validation (STRICT — only @gmail.com allowed)
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(newUser.email.trim())) {
      alert("Only Gmail addresses are allowed (example@gmail.com).");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // ⭐ FIXED: Send phoneNo instead of phone
      await axios.post(
        "http://localhost:5000/api/admin/add-user",
        {
          name: newUser.name,
          email: newUser.email,
          phoneNo: newUser.phone, // ⭐ Correct field name for backend
          password: newUser.password,
          role: "user",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("User added successfully!");
      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main */}
      <div className="flex items-center justify-center min-h-[90vh] px-6">
        <div
          className="w-full max-w-lg p-10 bg-white shadow-2xl border border-gray-200 rounded-3xl 
                     transition-all duration-300 hover:shadow-indigo-300/50 hover:scale-[1.01]"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 px-4 py-2 mb-6 text-indigo-600 transition-all duration-300 border border-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-105"
          >
            ← Back
          </button>

          <h2 className="mb-6 text-3xl font-extrabold text-center text-indigo-700">
            Add New User
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              className="input-style"
              required
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email (Only Gmail allowed)"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
              className="input-style"
              required
            />

            {/* Phone */}
            <input
              type="text"
              placeholder="Phone (10 digits)"
              value={newUser.phone}
              maxLength={10}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setNewUser({ ...newUser, phone: onlyNumbers });
              }}
              className="input-style"
              required
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="input-style"
              required
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 mt-2 text-white bg-indigo-600 rounded-2xl font-semibold 
                         shadow-lg transition-all duration-300 hover:bg-indigo-700 hover:scale-[1.02] 
                         active:scale-[0.97]"
            >
              Add User
            </button>
          </form>
        </div>
      </div>

      {/* Custom input CSS */}
      <style>
        {`
          .input-style {
            padding: 14px;
            border-radius: 12px;
            border: 1px solid #d1d5db;
            width: 100%;
            transition: 0.3s;
            outline: none;
          }
          .input-style:focus {
            border-color: #6366f1;
            box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
            transform: scale(1.01);
          }
        `}
      </style>
    </div>
  );
};

export default AddUser;
