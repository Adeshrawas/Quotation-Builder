import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Notification from "../components/Notification";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notify, setNotify] = useState({ type: "", message: "" });
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
  });

  const token = localStorage.getItem("token");

  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
    { code: "+971", name: "UAE" },
    { code: "+974", name: "Qatar" },
    { code: "+966", name: "Saudi Arabia" },
    { code: "+65", name: "Singapore" },
  ];

  useEffect(() => {
    // Setting global background
    document.body.className = "bg-gray-100";
    
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/single-user/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const u = res.data;
        const digits = u.phoneNo.replace(/\D/g, "");
        const local = digits.slice(-10);
        const country = "+" + digits.slice(0, digits.length - 10);

        setUserData({
          name: u.name,
          email: u.email,
          phone: local,
          countryCode: country || "+91",
        });
      } catch (err) {
        setNotify({ type: "error", message: "Error loading user data" });
      }
    };
    fetchUser();
  }, [id, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(userData.email.trim())) {
        setNotify({ type: "error", message: "Only Gmail allowed" });
        return;
      }

      const onlyDigits = userData.phone.replace(/\D/g, "");
      if (onlyDigits.length !== 10) {
        setNotify({ type: "error", message: "Phone must be 10 digits" });
        return;
      }

      await axios.put(
        `http://localhost:5000/api/admin/edit-user/${id}`,
        {
          name: userData.name,
          email: userData.email,
          phoneNo: onlyDigits,
          countryCode: userData.countryCode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotify({ type: "success", message: "User updated successfully!" });
      setTimeout(() => navigate("/admin"), 1200);
    } catch (err) {
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Update failed",
      });
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen px-6 pt-10 bg-gray-100">
      {notify.message && (
        <Notification
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify({ type: "", message: "" })}
        />
      )}

      <div className="w-full max-w-lg p-10 bg-white border border-gray-200 rounded-[2.5rem]">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-4 py-2 mb-6 font-bold text-teal-900 transition-all border border-gray-200 bg-gray-50 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h2 className="mb-6 text-3xl font-black text-center text-teal-900">
          Edit User Profile
        </h2>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="ml-1 text-xs font-black text-teal-900 uppercase">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="w-full input-style"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-black text-teal-900 uppercase">Gmail Address</label>
            <input
              type="email"
              placeholder="Email (Gmail only)"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="w-full input-style"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-black text-teal-900 uppercase">Contact Details</label>
            <div className="flex w-full gap-3">
              <select
                value={userData.countryCode}
                onChange={(e) => setUserData({ ...userData, countryCode: e.target.value })}
                className="w-[40%] p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-800 bg-white transition-all"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Phone"
                value={userData.phone}
                maxLength={10}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="flex-1 input-style"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-4 text-white bg-teal-900 rounded-2xl font-black 
                       hover:bg-teal-800 active:scale-[0.97] transition-all duration-200 uppercase tracking-wider"
          >
            Save Changes
          </button>
        </form>
      </div>

      <style>{`
        .input-style {
          padding: 14px;
          background-color: white;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          font-size: 15px;
          transition: 0.2s;
          outline: none;
        }
        .input-style:focus {
          border-color: #06d6a0;
          box-shadow: 0 0 0 2px rgba(6, 214, 160, 0.1);
        }
      `}</style>
    </div>
  );
};

export default EditUser;