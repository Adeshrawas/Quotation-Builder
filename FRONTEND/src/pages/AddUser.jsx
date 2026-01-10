import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Notification from "../components/Notification";

const AddUser = () => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [notify, setNotify] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
    { code: "+971", name: "UAE" },
    { code: "+974", name: "Qatar" },
    { code: "+966", name: "Saudi Arabia" },
    { code: "+81", name: "Japan" },
    { code: "+65", name: "Singapore" },
    { code: "+60", name: "Malaysia" },
    { code: "+93", name: "Afghanistan" },
    { code: "+355", name: "Albania" },
    { code: "+213", name: "Algeria" },
    { code: "+54", name: "Argentina" },
    { code: "+43", name: "Austria" },
    { code: "+32", name: "Belgium" },
    { code: "+55", name: "Brazil" },
    { code: "+56", name: "Chile" },
    { code: "+86", name: "China" },
    { code: "+57", name: "Colombia" },
    { code: "+53", name: "Cuba" },
    { code: "+420", name: "Czech Republic" },
    { code: "+45", name: "Denmark" },
    { code: "+20", name: "Egypt" },
    { code: "+358", name: "Finland" },
    { code: "+33", name: "France" },
    { code: "+49", name: "Germany" },
    { code: "+30", name: "Greece" },
  ];

  const [countryCode, setCountryCode] = useState("+91");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [search, setSearch] = useState("");

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

    const onlyDigits = newUser.phone.replace(/\D/g, "");

    if (onlyDigits.length !== 10) {
      setNotify({
        type: "error",
        message: "Phone number must be exactly 10 digits.",
      });
      return;
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(newUser.email.trim())) {
      setNotify({ type: "error", message: "Only Gmail allowed." });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/admin/add-user",
        {
          name: newUser.name,
          email: newUser.email,
          phoneNo: onlyDigits,
          countryCode,
          password: newUser.password,
          role: "user",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ⭐⭐⭐ ONLY THIS MESSAGE IS CHANGED ⭐⭐⭐
      setNotify({
        type: "success",
        message: "User added! Verification email sent.",
      });

      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Failed to add user",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {notify.message && (
        <Notification
          type={notify.type}
          message={notify.message}
          onClose={() => setNotify({ type: "", message: "" })}
        />
      )}

      <Header />

      <div className="flex items-start justify-center min-h-[90vh] pt-10 px-6">
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
            Add New User
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="bg-white input-style"
              required
            />

            <input
              type="email"
              placeholder="Email (Gmail only)"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="bg-white input-style"
              required
            />

            <div className="flex w-full gap-3">
              <div className="relative w-[40%]">
                <div
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="bg-white country-select"
                >
                  {countryCode} — {countryCodes.find((c) => c.code === countryCode)?.name}
                </div>

                {openDropdown && (
                  <div className="absolute z-50 w-full p-2 mt-1 bg-white border border-gray-300 shadow-lg rounded-xl">
                    <input
                      type="text"
                      placeholder="Search country..."
                      className="w-full p-2 mb-2 text-sm bg-white border rounded-lg"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="overflow-y-auto max-h-40">
                      {countryCodes
                        .filter((c) =>
                          (c.code + " " + c.name)
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map((c) => (
                          <div
                            key={c.code}
                            onClick={() => {
                              setCountryCode(c.code);
                              setOpenDropdown(false);
                              setSearch("");
                            }}
                            className="p-2 rounded-lg cursor-pointer hover:bg-indigo-100"
                          >
                            {c.code} — {c.name}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Phone"
                value={newUser.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setNewUser({
                    ...newUser,
                    phone: digits.slice(0, 10),
                  });
                }}
                className="flex-1 bg-white input-style"
                required
              />
            </div>

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="bg-white input-style"
              required
            />

            <button
              type="submit"
              className="w-full py-3 mt-2 text-white bg-indigo-600 rounded-2xl font-semibold 
                         shadow-lg hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.97] 
                         transition-all duration-300"
            >
              Add User
            </button>
          </form>
        </div>
      </div>

      <style>{`
        input:-webkit-autofill {
          background-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          color: #000 !important;
        }

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

        .country-select {
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          transition: 0.2s;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AddUser;
