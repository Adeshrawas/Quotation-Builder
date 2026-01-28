import React, { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw, MessageSquare } from "lucide-react";

const UserMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/messages/my-messages",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error loading messages", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-teal-900">
            My Messages
          </h1>
          <button
            onClick={loadMessages}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 font-bold text-white transition-all bg-teal-900 shadow-md rounded-xl hover:bg-teal-800 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white shadow-xl rounded-[2rem] text-center border border-gray-200">
            <div className="p-4 mb-4 text-gray-300 rounded-full bg-gray-50">
              <MessageSquare size={48} />
            </div>
            <p className="text-xl font-bold text-gray-500">No messages yet.</p>
            <p className="text-gray-400">When you contact support, your conversations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="overflow-hidden transition-all bg-white border border-gray-200 shadow-lg rounded-[2rem] hover:shadow-xl"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-teal-900">
                      {msg.title}
                    </h3>
                    <span
                      className={`px-4 py-1 text-xs font-black uppercase tracking-wider rounded-full shadow-sm ${
                        msg.status === "pending"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  
                  <p className="leading-relaxed text-gray-600">{msg.message}</p>

                  {msg.reply && (
                    <div className="relative p-5 mt-6 border-l-4 border-teal-800 bg-gray-50 rounded-r-2xl">
                      <div className="absolute top-0 left-0 w-2 h-2 bg-teal-800 rounded-full -translate-x-1.5 -translate-y-1"></div>
                      <p className="mb-1 text-sm font-black tracking-tight text-teal-900 uppercase">
                        Admin Response
                      </p>
                      <p className="italic text-gray-700">"{msg.reply}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessages;