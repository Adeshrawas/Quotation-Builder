import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, CheckCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";

const AdminQuotationNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notify, setNotify] = useState({ type: "", message: "" });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/messages/admin/quotations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const safeData = (res.data || []).filter((n) => n.type === "quotation" && n.quotation);
      setNotifications(safeData);
    } catch (err) {
      // Silenced to prevent localhost UI warnings
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, status: "read" } : n)));
    
    try {
      await axios.put(`http://localhost:5000/api/messages/admin/quotations/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotify({ type: "success", message: "Marked as read!" });
    } catch (err) {
      // Silenced error to avoid browser popup warnings
      loadNotifications(); 
    }
  };

  const deleteNotification = async (id) => {
    // Removed window.confirm so it deletes immediately
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    
    try {
      await axios.delete(`http://localhost:5000/api/messages/admin/quotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotify({ type: "success", message: "Notification deleted!" });
    } catch (err) {
      // Silenced error to avoid browser popup warnings
      loadNotifications();
    }
  };

  useEffect(() => {
    document.body.className = "bg-gray-100";
    loadNotifications();
  }, []);

  return (
    <div className="flex items-start justify-center min-h-screen py-8 bg-gray-100">
      <div className="w-full max-w-6xl p-6 bg-white border border-gray-200 rounded-[2.5rem] md:p-10 shadow-sm">
        
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-5 py-2.5 mb-8 font-bold text-teal-900 transition border border-gray-200 bg-gray-50 rounded-2xl hover:bg-gray-100 shadow-sm"
        >
          <ArrowLeft size={20} /> Back to Admin
        </button>

        <h1 className="mb-8 text-4xl font-extrabold text-teal-900">Quotation Notifications</h1>

        {loading ? (
          <p className="py-10 font-medium text-center text-teal-900">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="py-10 italic text-center text-gray-400">No quotation notifications found.</p>
        ) : (
          <div className="overflow-hidden border border-gray-100 rounded-[1.5rem] shadow-sm">
            <table className="w-full text-sm">
              <thead className="text-white bg-teal-900">
                <tr>
                  <th className="p-5 font-bold tracking-wider text-left uppercase text-[11px]">User</th>
                  <th className="p-5 font-bold tracking-wider text-left uppercase text-[11px]">Quotation Items</th>
                  <th className="p-5 font-bold tracking-wider text-right uppercase text-[11px]">Grand Total</th>
                  <th className="p-5 font-bold tracking-wider text-center uppercase text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {notifications.map((n) => (
                  <tr key={n._id} className="transition-colors hover:bg-gray-50/50">
                    <td className="p-5 font-bold text-teal-900 align-top">
                      {n.userId?.name || n.userId?.email || "User"}
                    </td>
                    <td className="p-5 align-top">
                      {n.quotation.items?.length > 0 ? (
                        <div className="space-y-2">
                          {n.quotation.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col p-3 border border-gray-100 bg-gray-50 rounded-xl">
                              <span className="font-bold text-teal-900">• {item.name || item.itemName}</span> 
                              <span className="text-xs text-gray-500">Size: {item.length} × {item.height} | Rate: ₹{item.rate}</span>
                              <span className="mt-1 text-xs font-bold text-gray-500">Subtotal: ₹{item.total || item.totalPrice}</span>
                            </div>
                          ))}
                        </div>
                      ) : <span className="italic text-gray-400">No items found</span>}
                    </td>
                    <td className="p-5 text-right align-top">
                      <span className="text-xl font-black text-teal-900">₹{n.quotation.grandTotal}</span>
                    </td>
                    <td className="p-5 align-top">
                      <div className="flex items-center justify-center gap-4">
                        {n.status === "unread" ? (
                          <button 
                            onClick={() => markAsRead(n._id)} 
                            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-black text-white transition bg-teal-900 shadow-sm rounded-xl hover:bg-teal-800 active:scale-95"
                          >
                            <CheckCircle size={14} /> MARK READ
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 text-[10px] font-black text-gray-300 bg-gray-50 border border-gray-100 rounded-lg uppercase tracking-widest">Read</span>
                        )}
                        <button 
                          onClick={() => deleteNotification(n._id)} 
                          className="p-2 text-red-500 transition-colors rounded-full hover:bg-red-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {notify.message && (
        <Notification type={notify.type} message={notify.message} onClose={() => setNotify({ type: "", message: "" })} />
      )}
    </div>
  );
};

export default AdminQuotationNotifications;