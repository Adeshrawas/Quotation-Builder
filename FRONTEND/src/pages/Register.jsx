import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { fileToBase64 } from "../utils/fileToBase64";
import { Eye, EyeOff, Image as ImageIcon, X, ArrowLeft } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [notify, setNotify] = useState({ type: "", message: "" });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA / Canada" },
    { code: "+44", name: "United Kingdom" },
    { code: "+61", name: "Australia" },
    { code: "+971", name: "UAE" },
    { code: "+65", name: "Singapore" },
  ];

  const [countryCode, setCountryCode] = useState("+91");

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
      let logoBase64 = null;
      if (logoFile) logoBase64 = await fileToBase64(logoFile);

      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        phoneNo: phone,
        countryCode,
        logoBase64,
      });

      setNotify({ type: "success", message: "Admin registered successfully!" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gray-100">
      {notify.message && (
        <Notification
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify({ type: "", message: "" })}
        />
      )}

      <div className="relative w-full max-w-md p-10 overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-3xl">
        <div className="absolute w-56 h-56 bg-teal-900 rounded-full -top-20 -right-20 opacity-10 blur-3xl"></div>

        {/* ✅ SAME BACK BUTTON STYLE */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 mb-8 font-bold text-teal-900 transition border border-gray-200 bg-gray-50 rounded-2xl hover:bg-gray-100 shadow-sm"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h2 className="mb-8 text-3xl font-extrabold text-center text-teal-900">
          Register Admin
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
          {/* LOGO */}
          <div className="flex flex-col items-center mb-4">
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative flex items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 hover:border-teal-800"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="object-cover w-full h-full" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon size={28} />
                  <span className="mt-1 text-[10px] font-bold">ADD LOGO</span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="hidden"
            />

            {logoFile && (
              <button
                type="button"
                onClick={() => setLogoFile(null)}
                className="flex items-center gap-1 mt-2 text-xs font-bold text-red-500"
              >
                <X size={12} /> Remove Logo
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50"
            required
          />

          <div className="flex gap-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-[40%] p-3 border border-gray-200 rounded-xl bg-gray-50"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-400 right-3 top-3 hover:text-teal-900"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 text-lg font-bold text-white bg-teal-900 rounded-xl hover:bg-teal-800"
          >
            Register Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
