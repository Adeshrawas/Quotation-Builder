import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import Notification from "../components/Notification";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [notify, setNotify] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/messages/admin/messages",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data || []);
    } catch (err) {
      // Catch block silenced to prevent localhost warnings
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (id) => {
    const reply = replyText[id];
    if (!reply?.trim()) {
      setNotify({ type: "error", message: "Reply cannot be empty" });
      return;
    }

    try {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, reply: reply, status: "read" } : m
        )
      );
      
      await axios.put(
        `http://localhost:5000/api/messages/reply/${id}`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplyText({ ...replyText, [id]: "" });
      setNotify({ type: "success", message: "Reply sent successfully!" });
    } catch {
      setNotify({ type: "error", message: "Reply failed" });
      loadMessages();
    }
  };

  const deleteMessage = async (id) => {
    try {
      setMessages((prev) => prev.filter((m) => m._id !== id));

      await axios.delete(
        `http://localhost:5000/api/messages/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotify({ type: "success", message: "Message deleted successfully!" });
    } catch {
      setNotify({ type: "error", message: "Failed to delete message" });
      loadMessages();
    }
  };

  useEffect(() => {
    document.body.className = "bg-gray-100";
    loadMessages();
  }, []);

  return (
    /* FIXED: Uses bg-gray-100 to match the full page background */
    <div className="flex items-start justify-center min-h-screen py-8 bg-gray-100">
      <div className="w-full max-w-6xl p-6 bg-white border border-gray-200 rounded-[2.5rem] md:p-10 shadow-sm">
        
        {/* Navigation Button */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-5 py-2.5 mb-8 font-bold text-teal-900 transition border border-gray-200 bg-gray-50 rounded-2xl hover:bg-gray-100 shadow-sm"
        >
          <ArrowLeft size={20} /> Back to Admin
        </button>

        <h1 className="mb-8 text-4xl font-extrabold text-teal-900">User Messages</h1>

        {loading ? (
          <p className="py-10 font-medium text-center text-teal-900">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="py-10 font-medium text-center text-gray-400">No messages found.</p>
        ) : (
          <div className="space-y-6">
            {messages.map((m) => (
              <div key={m._id} className="relative p-6 transition border border-gray-100 bg-white rounded-[1.5rem] hover:border-gray-300 shadow-sm">
                
                {/* Status & Delete Badge */}
                <div className="absolute flex items-center gap-3 top-6 right-6">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${m.status === "unread" ? "bg-teal-800 text-white border-teal-800" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {m.status}
                  </span>
                  <button onClick={() => deleteMessage(m._id)} className="p-2 text-red-500 transition rounded-lg hover:bg-gray-100 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {/* User Info */}
                <div className="mb-2">
                  <p className="text-sm font-bold text-teal-600">
                    {m.userId?.name || m.userId?.email} 
                    <span className="ml-2 font-normal text-gray-400">• {new Date(m.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <h3 className="text-xl font-bold text-teal-900">{m.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{m.message}</p>
                
                {/* Category Badge */}
                <div className="mt-3 inline-block px-3 py-1 text-[11px] font-bold text-teal-900 uppercase bg-gray-100 rounded-lg">
                  Category: {m.category}
                </div>

                {/* Reply Section */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  {m.reply ? (
                    <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                      <p className="mb-1 text-xs font-black tracking-wider text-teal-900 uppercase">Admin Reply:</p>
                      <p className="text-gray-700">{m.reply}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={replyText[m._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [m._id]: e.target.value })}
                        className="flex-1 p-3 text-sm transition-all border border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-teal-800"
                        placeholder="Type your reply here..."
                      />
                      <button 
                        onClick={() => sendReply(m._id)} 
                        /* FIXED: Applied requested #06d6a0 and hover colors */
                        className="flex items-center gap-2 px-6 py-3 font-bold text-white transition bg-[#06d6a0] shadow-sm rounded-xl hover:bg-[#05bc8c] active:scale-95"
                      >
                        <Send size={18} /> Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notify.message && (
        <Notification 
          type={notify.type} 
          message={notify.message} 
          onClose={() => setNotify({ type: "", message: "" })} 
        />
      )}
    </div>
  );
};

export default AdminMessages;