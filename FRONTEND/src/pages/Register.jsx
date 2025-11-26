import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [notify, setNotify] = useState({ type: "", message: "" });
  const role = "admin";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(logoFile);
  }, [logoFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNo", phone);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (logoFile) formData.append("logo", logoFile);

      await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotify({ type: "success", message: "Admin registered successfully!" });

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Register error:", err);
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      
      {/* Notification WITHOUT close button */}
      {notify.message && (
        <Notification
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify({ type: "", message: "" })}
        />
      )}

      <div className="relative w-[420px] p-10 bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
        <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute w-56 h-56 rounded-full -bottom-16 -left-16 bg-gradient-to-bl from-indigo-400 to-blue-500 opacity-20 blur-3xl"></div>

        <h2 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">
          Register Admin
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Upload Logo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded-lg"
            />
            {logoPreview && (
              <img
                src={logoPreview}
                alt="logo preview"
                className="object-contain p-1 border rounded-md w-28 h-28"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transform transition-all duration-200 active:scale-[0.98]"
          >
            Register Admin
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
