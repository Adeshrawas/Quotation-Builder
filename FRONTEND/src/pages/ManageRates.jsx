import React, { useState, useEffect } from "react";
import { Trash2, X, CheckCircle, Edit3 } from "lucide-react";
import { createRate, updateRate, deleteRate } from "../api";
import { useNavigate } from "react-router-dom";
import { useRates } from "../context/RateContext"; // ⭐ ADDED

const ManageRates = () => {
  const { rates, fetchRates } = useRates(); // ⭐ GET GLOBAL fetchRates
  const [itemName, setItemName] = useState("");
  const [rate, setRate] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newRate, setNewRate] = useState("");
  const navigate = useNavigate();

  // Admin-only access
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      alert("Access denied. Only admins can access this page.");
      navigate("/generate-quotation");
    } else {
      fetchRates(); // ⭐ Load rates globally
    }
  }, [navigate]);

  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
  };

  // Add / Update
  const handleAddOrUpdate = async () => {
    if (!itemName.trim()) {
      setError("Item Name is required.");
      clearMessages();
      return;
    }

    const rateValue = parseFloat(rate);
    if (isNaN(rateValue) || rateValue <= 0) {
      setError("Rate must be a positive number.");
      clearMessages();
      return;
    }

    try {
      const existing = rates.find(
        (r) => r.itemName?.toLowerCase() === itemName.toLowerCase()
      );

      if (existing) {
        await updateRate(existing._id, itemName, rateValue);
        setSuccess(`Rate for ${itemName} updated to ₹${rateValue}/sq.ft.`);
      } else {
        await createRate(itemName, rateValue);
        setSuccess(`New rate for ${itemName} added successfully.`);
      }

      await fetchRates(); // ⭐ IMPORTANT: Refresh for all pages
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Error saving rate. Check backend or token."
      );
    }

    setItemName("");
    setRate("");
    clearMessages();
  };

  // Delete
  const handleDelete = async (id, name) => {
    try {
      await deleteRate(id);
      setSuccess(`Rate for ${name} deleted successfully.`);
      await fetchRates(); // ⭐ REFRESH CONTEXT
      clearMessages();
    } catch (err) {
      setError("Error deleting item.");
    }
  };

  // Edit Save
  const handleEditSave = async (id, name) => {
    const rateValue = parseFloat(newRate);
    if (isNaN(rateValue) || rateValue <= 0) {
      setError("Rate must be a valid positive number.");
      clearMessages();
      return;
    }

    try {
      await updateRate(id, name, rateValue);
      setEditingItem(null);
      setNewRate("");
      setSuccess(`Rate for ${name} updated to ₹${rateValue}/sq.ft.`);
      await fetchRates(); // ⭐ REFRESH
      clearMessages();
    } catch (err) {
      setError("Error updating rate.");
    }
  };

  return (
    <div
      className="flex items-start justify-center min-h-screen pt-6 pb-10 overflow-y-auto bg-gray-50"
      style={{ scrollbarWidth: "none" }}
    >
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <div className="w-full max-w-6xl p-6 mx-auto bg-white border border-gray-200 shadow-2xl rounded-3xl">
        <h1 className="text-4xl font-extrabold text-gray-900">Rate Management</h1>
        <p className="mt-2 text-lg text-gray-500">
          Set square foot rates for your construction items. All rates are in{" "}
          <span className="font-medium text-gray-700">₹ per sq.ft.</span>
        </p>

        {(success || error) && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${
              success ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center">
              {success ? (
                <CheckCircle className="w-6 h-6 mr-2" />
              ) : (
                <X className="w-6 h-6 mr-2" />
              )}
              <p className="font-medium">{success || error}</p>
              <button
                onClick={() => {
                  setSuccess(null);
                  setError(null);
                }}
                className="ml-4 text-white hover:text-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Add/Update Section */}
        <div className="p-6 mt-6 bg-white border-2 border-indigo-100 rounded-3xl hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-indigo-700">
            + Add / Update Item Rate
          </h2>
          <div className="flex flex-wrap items-center mt-4 space-x-4">
            <input
              type="text"
              placeholder="e.g., Painting, POP, Tiling"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="flex-1 px-5 py-2 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-48 px-5 py-2 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddOrUpdate}
              className="px-8 py-2 text-lg font-semibold text-white bg-blue-600 shadow-md rounded-xl hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* Rates List Section */}
        <div className="p-6 mt-6 border-2 border-indigo-100 bg-indigo-50 rounded-3xl hover:shadow-2xl">
          <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
            Edit or Delete Rates
          </h2>

          {rates.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rates.map((item) => (
                <div
                  key={item._id}
                  className="relative p-4 bg-white border-2 border-gray-200 rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300"
                >
                  <button
                    onClick={() => handleDelete(item._id, item.itemName)}
                    className="absolute p-1 text-red-500 rounded-full top-2 right-2 hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>

                  <h4 className="text-xl font-semibold text-indigo-700">
                    {item.itemName}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">Rate (₹/sq.ft)</p>

                  {editingItem === item._id ? (
                    <div className="flex items-center mt-2 space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        className="w-24 px-3 py-1 text-lg font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleEditSave(item._id, item.itemName)}
                        className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-1 text-sm font-semibold text-white bg-gray-400 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{item.rate.toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingItem(item._id);
                          setNewRate(item.rate);
                        }}
                        className="flex items-center px-2 py-1 text-sm font-semibold text-white bg-blue-600 rounded-lg"
                      >
                        <Edit3 size={14} className="mr-1" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRates;
