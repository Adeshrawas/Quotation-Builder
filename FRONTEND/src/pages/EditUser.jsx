import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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

  // Load user data
  useEffect(() => {
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
          countryCode: country,
        });
      } catch (err) {
        setNotify({ type: "error", message: "Error loading user data" });
      }
    };

    fetchUser();
  }, [id]);

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

      <div
        className="w-full max-w-lg p-10 bg-white rounded-3xl shadow-2xl border border-gray-200 
                   transition-all duration-300 hover:shadow-indigo-300/50 hover:scale-[1.01]"
      >
        <button
          onClick={() => navigate("/admin")}
          className="px-4 py-2 mb-6 text-indigo-600 transition-all border border-indigo-600 rounded-xl hover:bg-indigo-50 hover:scale-105"
        >
          ← Back
        </button>

        <h2 className="mb-6 text-3xl font-extrabold tracking-wide text-center text-indigo-700">
          Edit User
        </h2>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Full Name"
            value={userData.name}
            onChange={(e) =>
              setUserData({ ...userData, name: e.target.value })
            }
            className="bg-white input-style"
            required
          />

          <input
            type="email"
            placeholder="Email (Gmail only)"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            className="bg-white input-style"
            required
          />

          <div className="flex w-full gap-3">
            <select
              value={userData.countryCode}
              onChange={(e) =>
                setUserData({ ...userData, countryCode: e.target.value })
              }
              className="w-[40%] p-3 border rounded-xl"
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
              className="flex-1 bg-white input-style"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 text-white bg-indigo-600 rounded-2xl font-semibold 
                       shadow-lg hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.97] 
                       transition-all duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>

      <style>{`
        .input-style {
          padding: 14px;
          border-radius: 14px;
          border: 1px solid #d1d5db;
          font-size: 15px;
          transition: 0.2s;
        }
        .input-style:focus {
          border-color: #6366f1;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
};

export default EditUser;
