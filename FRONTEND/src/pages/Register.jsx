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
  const navigate = useNavigate();

  const role = "admin";

  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA / Canada" },
    { code: "+44", name: "United Kingdom" },
    { code: "+61", name: "Australia" },
    { code: "+971", name: "UAE" },
    { code: "+977", name: "Nepal" },
    { code: "+880", name: "Bangladesh" },
    { code: "+92", name: "Pakistan" },
    { code: "+94", name: "Sri Lanka" },
    { code: "+65", name: "Singapore" },
    { code: "+62", name: "Indonesia" },
    { code: "+60", name: "Malaysia" },
    { code: "+81", name: "Japan" },
    { code: "+82", name: "South Korea" },
    { code: "+86", name: "China" },
    { code: "+7", name: "Russia" },
    { code: "+33", name: "France" },
    { code: "+49", name: "Germany" },
    { code: "+39", name: "Italy" },
    { code: "+34", name: "Spain" },
    { code: "+31", name: "Netherlands" },
    { code: "+46", name: "Sweden" },
    { code: "+41", name: "Switzerland" },
    { code: "+45", name: "Denmark" },
    { code: "+47", name: "Norway" },
    { code: "+48", name: "Poland" },
    { code: "+55", name: "Brazil" },
    { code: "+54", name: "Argentina" },
    { code: "+57", name: "Colombia" },
    { code: "+63", name: "Philippines" },
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
    if (!logoFile) return setLogoPreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(logoFile);
  }, [logoFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // ⭐ FIXED: send only 10 digits
      formData.append("phoneNo", phone);

      // ⭐ Send country code separately
      formData.append("countryCode", countryCode);

      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      if (logoFile) formData.append("logo", logoFile);

      await axios.post("http://localhost:5000/api/auth/register", formData);

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
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {notify.message && (
        <Notification
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify({ type: "", message: "" })}
        />
      )}

      <div className="relative w-full max-w-md p-10 overflow-hidden bg-white border border-blue-100 shadow-2xl rounded-3xl">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 mb-6 text-indigo-600 transition-all border border-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-105"
        >
          ← Back
        </button>

        <h2 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">
          Register Admin
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none"
            required
          />

          <div className="flex w-full gap-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-[45%] p-4 rounded-xl border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none"
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
              className="flex-1 p-4 border border-gray-300 bg-gray-50 rounded-xl focus:outline-none"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border rounded-xl bg-gray-50 focus:outline-none"
            required
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Upload Logo (optional)</label>

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
            className="w-full py-3 mt-2 text-lg font-semibold text-white bg-indigo-600 shadow-lg rounded-xl hover:bg-indigo-700"
          >
            Register Admin
          </button>

          <p className="mt-4 text-sm text-center text-gray-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>
        </form>

        {/* Autofill Fix */}
        <style>{`
          input:-webkit-autofill {
            background-color: #f9fafb !important;
            -webkit-box-shadow: 0 0 0 1000px #f9fafb inset !important;
            box-shadow: 0 0 0 1000px #f9fafb inset !important;
            color: #000 !important;
          }
        `}</style>

      </div>
    </div>
  );
};

export default Register;
