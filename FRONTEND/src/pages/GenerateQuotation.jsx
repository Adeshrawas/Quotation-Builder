// pages/GenerateQuotation.jsx
import React, { useState, useEffect } from "react";
import { PlusCircle, Calculator, Download } from "lucide-react";
import { useRates } from "../context/RateContext";
import { useQuote } from "../context/QuoteContext";
import Select from "react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import Notification from "../components/Notification";

const GenerateQuotation = () => {
  const { rates } = useRates();
  const { quoteItems, addItem, resetQuote } = useQuote();

  const [inputData, setInputData] = useState({
    item: "",
    length: 0.0,
    height: 0.0,
  });

  const [adminLogo, setAdminLogo] = useState(null);
  const [adminName, setAdminName] = useState("Admin");

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaint, setComplaint] = useState({
    category: "Price Issue",
    title: "",
    message: "",
  });

  const [myMessages, setMyMessages] = useState([]);
  const [showMyMessages, setShowMyMessages] = useState(false);

  // Notification state (used instead of native alert)
  const [notify, setNotify] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ⭐ FIX: Allow scrolling
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }, []);

  // Fetch admin logo + name
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    if (user.role === "admin") {
      setAdminName(user.name || "Admin");
      if (user.logoUrl) setAdminLogo(`http://localhost:5000${user.logoUrl}`);
    } else if (user.role === "user" && user.adminId) {
      fetch(`http://localhost:5000/api/auth/admin-logo/${user.adminId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.logoUrl) setAdminLogo(`http://localhost:5000${data.logoUrl}`);
          if (data.name) setAdminName(data.name);
        })
        .catch(() => {});
    }
  }, []);

  // Fetch user's messages
  const fetchMyMessages = async () => {
    try {
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/messages/my-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyMessages(res.data || []);
    } catch (err) {
      console.error("Fetch my messages error:", err);
      setMyMessages([]);
    }
  };

  useEffect(() => {
    fetchMyMessages();
  }, []);

  const adminRates = rates;

  const calculateCost = (itemName, length, height) => {
    const rateItem = adminRates.find((r) => r.itemName === itemName);
    if (!rateItem) return 0;
    return (length * height * rateItem.rate).toFixed(2);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!inputData.item || inputData.length <= 0 || inputData.height <= 0) {
      // keep as inline feedback for quick UX
      setNotify({ type: "error", message: "Please select an item and enter valid dimensions." });
      return;
    }

    const cost = calculateCost(inputData.item, inputData.length, inputData.height);

    addItem({
      id: Date.now(),
      name: inputData.item,
      length: inputData.length.toFixed(1),
      height: inputData.height.toFixed(1),
      cost,
    });

    setInputData({ item: "", length: 0.0, height: 0.0 });
  };

  const handleResetQuoteList = () => resetQuote();

  const totalCost = quoteItems.reduce((sum, item) => sum + parseFloat(item.cost), 0);

  const itemOptions = adminRates.map((r) => ({
    value: r.itemName,
    label: `${r.itemName} (Rs.${r.rate}/sq.ft)`,
  }));

  // Complaint handlers
  const openComplaintModal = () => {
    setComplaint({ category: "Price Issue", title: "", message: "" });
    setShowComplaintModal(true);
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      if (!complaint.title || !complaint.message) {
        setNotify({ type: "error", message: "Please add both title and message." });
        return;
      }
      await axios.post(
        "http://localhost:5000/api/messages/send",
        complaint,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // show in-app notification (instead of browser alert)
      setNotify({ type: "success", message: "Complaint sent to admin" });

      setShowComplaintModal(false);
      fetchMyMessages();
    } catch (err) {
      console.error("Send complaint error:", err);
      setNotify({
        type: "error",
        message: err.response?.data?.message || "Failed to send complaint",
      });
    }
  };

  // PDF download
  const handleDownloadReceipt = async () => {
    if (quoteItems.length === 0) {
      setNotify({ type: "error", message: "No quotation items to download." });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.name || user?.email?.split("@")[0] || "User";

    const doc = new jsPDF({ unit: "pt", format: "A4" });

    let logoImg = null;
    if (adminLogo) {
      const logo = await fetch(adminLogo);
      const blob = await logo.blob();
      const reader = new FileReader();
      const loadImage = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
      reader.readAsDataURL(blob);
      logoImg = await loadImage;
    }

    if (logoImg) {
      doc.addImage(logoImg, "PNG", 230, 20, 150, 80);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RECEIPT", 297.5, 120, { align: "center" });

    doc.setFillColor(10, 70, 160);
    doc.roundedRect(60, 150, 475, 60, 8, 8, "F");
    doc.setTextColor("#fff");
    doc.setFontSize(13);
    doc.text(`FROM: ${adminName}`, 80, 175);
    doc.text(`TO: ${userName}`, 80, 200);

    doc.setTextColor("#000");
    const today = new Date().toLocaleDateString();
    doc.text(`Date: ${today}`, 60, 235);

    autoTable(doc, {
      startY: 260,
      head: [["ITEM", "RATE (Rs.)"]],
      body: quoteItems.map((i) => [i.name, Number(i.cost).toFixed(2)]),
      styles: { font: "helvetica", fontSize: 12, halign: "center" },
      headStyles: { fillColor: [225, 235, 255], textColor: [0, 0, 80] },
      margin: { left: 60, right: 60 },
    });

    const y = doc.lastAutoTable.finalY + 40;
    doc.setFontSize(20);
    doc.setTextColor(10, 70, 160);
    doc.text(`TOTAL: Rs.${totalCost.toFixed(2)}`, 60, y);

    doc.save("Quotation_Receipt.pdf");
  };

  return (
    <div className="flex items-start justify-center min-h-screen pt-6 pb-10 bg-gray-50">
      <div className="w-full p-6 bg-white shadow-xl max-w-7xl rounded-3xl md:p-10">

        {/* show notifications */}
        {notify.message && (
          <Notification
            type={notify.type}
            message={notify.message}
            onClose={() => setNotify({ type: "", message: "" })}
          />
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col justify-between mb-3 sm:flex-row sm:items-center">
          <h2 className="text-4xl font-extrabold text-left text-gray-800">Generate Quotation</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 shadow-md rounded-xl hover:bg-green-700"
            >
              <Download size={18} /> Receipt PDF
            </button>

            {user?.role === "user" && (
              <button
                onClick={openComplaintModal}
                className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 shadow-md rounded-xl hover:bg-red-700"
              >
                Report / Complain
              </button>
            )}
          </div>
        </div>

        <p className="mb-10 text-lg text-gray-600">
          Select an item and enter dimensions to calculate the total cost automatically.
        </p>

        {/* TWO MAIN SECTIONS */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

          {/* LEFT INPUT SECTION */}
          <div className="p-6 bg-white border-2 border-gray-100 shadow rounded-3xl hover:shadow-2xl">
            <h3 className="flex items-center pb-3 mb-6 text-2xl font-semibold text-blue-700 border-b">
              <Calculator className="w-6 h-6 mr-2 text-blue-500" /> Calculation Input
            </h3>

            <form onSubmit={handleAddItem}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-bold text-gray-700">Select Item</label>
                <Select
                  options={itemOptions}
                  value={itemOptions.find((opt) => opt.value === inputData.item) || null}
                  onChange={(s) => setInputData({ ...inputData, item: s.value })}
                  placeholder="Select construction item..."
                />
              </div>

              <div className="flex mb-8 space-x-6">
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-bold text-gray-700">Length (ft)</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={inputData.length.toFixed(1)}
                      onChange={(e) =>
                        setInputData({
                          ...inputData,
                          length: parseFloat(e.target.value) || 0.0,
                        })
                      }
                      step="0.1"
                      min="0"
                      className="w-full h-12 p-3 font-mono text-right border-2 border-gray-300 rounded-l-xl"
                    />
                    <span className="flex items-center justify-center px-3 bg-gray-200 border border-gray-300 rounded-r-xl">
                      ft
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block mb-2 text-sm font-bold text-gray-700">Height (ft)</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={inputData.height.toFixed(1)}
                      onChange={(e) =>
                        setInputData({
                          ...inputData,
                          height: parseFloat(e.target.value) || 0.0,
                        })
                      }
                      step="0.1"
                      min="0"
                      className="w-full h-12 p-3 font-mono text-right border-2 border-gray-300 rounded-l-xl"
                    />
                    <span className="flex items-center justify-center px-3 bg-gray-200 border border-gray-300 rounded-r-xl">
                      ft
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center justify-center w-full h-12 px-4 font-bold text-white bg-blue-600 shadow rounded-xl hover:bg-blue-700"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Add Item
                </button>

                <button
                  type="button"
                  onClick={() => setInputData({ item: "", length: 0.0, height: 0.0 })}
                  className="flex items-center justify-center w-full h-12 px-4 font-semibold bg-gray-200 rounded-xl hover:bg-gray-300"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT RESULT SECTION */}
          <div className="p-6 border-2 border-blue-100 shadow-lg bg-blue-50 rounded-3xl hover:shadow-2xl">
            <h3 className="flex items-center pb-3 mb-6 text-2xl font-semibold text-blue-700 border-b">
              Rs. Calculation Results
            </h3>

            {quoteItems.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white border-2 border-gray-300 border-dashed rounded-xl">
                No items added yet.
              </div>
            ) : (
              <>
                <div className="mb-6 overflow-x-auto shadow-md rounded-xl">
                  <table className="min-w-full divide-y divide-blue-200 ">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-3 font-bold text-left text-blue-700">Item</th>
                        <th className="px-4 py-3 font-bold text-right text-blue-700">
                          L × H (ft)
                        </th>
                        <th className="px-4 py-3 font-bold text-right text-blue-700">
                          Cost (Rs.)
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-blue-100">
                      {quoteItems.map((item) => (
                        <tr key={item.id} className="transition hover:bg-blue-50">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 font-mono text-right">
                            {item.length} × {item.height}
                          </td>
                          <td className="px-4 py-3 font-bold text-right text-blue-600">
                            Rs.{item.cost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-4 text-white bg-blue-600 shadow-2xl rounded-xl">
                  <span className="text-xl font-bold">Total Quotation Cost:</span>
                  <span className="text-3xl font-extrabold">Rs.{totalCost.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="mt-8">
              <button
                onClick={handleResetQuoteList}
                disabled={quoteItems.length === 0}
                className={`w-full h-12 px-4 font-bold rounded-xl transition ${
                  quoteItems.length === 0
                    ? "bg-red-300 cursor-not-allowed text-gray-100"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Reset Quote List
              </button>
            </div>
          </div>
        </div>

        {/* ================= My Messages (User) ================= */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-800">My Messages</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowMyMessages((s) => !s);
                  if (!showMyMessages) fetchMyMessages();
                }}
                className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-lg"
              >
                {showMyMessages ? "Hide" : "Show"}
              </button>
              <button
                onClick={fetchMyMessages}
                className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-lg"
              >
                Refresh
              </button>
            </div>
          </div>

          {showMyMessages && (
            <div className="p-4 bg-white border shadow-sm rounded-xl">
              {myMessages.length === 0 ? (
                <p className="text-gray-500">You have no messages yet.</p>
              ) : (
                <div className="space-y-4">
                  {myMessages.map((m) => (
                    <div key={m._id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">
                            <strong>{m.title}</strong> •{" "}
                            {new Date(m.createdAt).toLocaleString()}
                          </div>
                          <div className="mt-1 text-gray-700">{m.message}</div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm ${
                            m.status === "open"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {m.status.toUpperCase()}
                        </div>
                      </div>

                      {m.reply && (
                        <div className="p-3 mt-3 bg-white border rounded-lg">
                          <div className="text-sm text-gray-600">Admin Reply:</div>
                          <div className="mt-1 text-gray-800">{m.reply}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= Complaint Modal ================= */}
        {showComplaintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                Send Complaint to Admin
              </h3>

              <form onSubmit={submitComplaint} className="flex flex-col gap-3">
                <select
                  value={complaint.category}
                  onChange={(e) =>
                    setComplaint({ ...complaint, category: e.target.value })
                  }
                  className="p-3 border rounded-lg"
                >
                  <option>Price Issue</option>
                  <option>Work Issue</option>
                  <option>Other</option>
                </select>

                <input
                  value={complaint.title}
                  onChange={(e) =>
                    setComplaint({ ...complaint, title: e.target.value })
                  }
                  placeholder="Title"
                  className="p-3 border rounded-lg"
                  required
                />

                <textarea
                  value={complaint.message}
                  onChange={(e) =>
                    setComplaint({ ...complaint, message: e.target.value })
                  }
                  placeholder="Describe your issue..."
                  className="p-3 border rounded-lg h-28"
                  required
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GenerateQuotation;
