import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Trash2 } from "lucide-react";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (id) => {
    const reply = replyText[id];
    if (!reply?.trim()) return alert("Reply cannot be empty");

    try {
      await axios.put(
        `http://localhost:5000/api/messages/reply/${id}`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplyText({ ...replyText, [id]: "" });
      loadMessages();
    } catch {
      alert("Reply failed");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/messages/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => prev.filter((m) => m._id !== id));

      setToast("Message deleted successfully!");
      setTimeout(() => setToast(null), 2000);
    } catch {
      alert("Failed to delete message");
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl p-8 mx-auto bg-white border border-indigo-100 shadow-2xl rounded-3xl">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-indigo-700 bg-indigo-100 rounded-xl hover:bg-indigo-200"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="mb-8 text-4xl font-extrabold text-center text-indigo-700">
          Admin – User Messages
        </h1>

        {loading ? (
          <p className="text-center text-indigo-700">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-600">No messages found.</p>
        ) : (
          <div className="space-y-6">
            {messages.map((m) => (
              <div
                key={m._id}
                className="relative p-6 border border-indigo-100 shadow bg-indigo-50 rounded-2xl hover:shadow-lg"
              >
                {/* RIGHT SIDE ACTIONS */}
                <div className="absolute flex items-center gap-2 right-4 top-4">

                  {/* STATUS BADGE */}
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold shadow ${
                      m.status === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {m.status.toUpperCase()}
                  </span>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => deleteMessage(m._id)}
                    className="p-2 text-red-600 bg-red-100 rounded-full shadow hover:bg-red-200"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

                {/* CONTENT */}
                <p className="text-sm text-gray-600">
                  <strong className="text-indigo-700">
                    {m.userId?.name || m.userId?.email}
                  </strong>{" "}
                  • {new Date(m.createdAt).toLocaleString()}
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-indigo-800">
                  {m.title}
                </h3>

                <p className="mt-2 text-gray-700">{m.message}</p>

                <p className="mt-3 text-sm text-gray-700">
                  Category:{" "}
                  <span className="font-semibold text-indigo-700">
                    {m.category}
                  </span>
                </p>

                {/* Reply Section */}
                <div className="mt-4">
                  {m.reply ? (
                    <div className="p-4 bg-white border shadow-sm rounded-xl">
                      <p className="text-sm font-medium text-gray-600">Admin Reply:</p>
                      <p className="mt-1 text-gray-800">{m.reply}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="text"
                        value={replyText[m._id] || ""}
                        onChange={(e) =>
                          setReplyText({ ...replyText, [m._id]: e.target.value })
                        }
                        className="flex-1 p-3 bg-white border border-indigo-200 outline-none rounded-xl focus:ring-2 focus:ring-indigo-400"
                        placeholder="Type reply..."
                      />
                      <button
                        onClick={() => sendReply(m._id)}
                        className="flex items-center gap-1 px-5 py-2 text-white bg-indigo-600 shadow rounded-xl hover:bg-indigo-700"
                      >
                        <Send size={18} />
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed px-6 py-3 text-white bg-green-600 shadow-lg bottom-6 right-6 rounded-xl animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
