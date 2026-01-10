import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminComplaints = () => {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const token = localStorage.getItem("token");

  const load = async () => {
    const res = await axios.get("http://localhost:5000/api/messages/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(res.data);
  };

  const sendReply = async (id) => {
    await axios.put(
      `http://localhost:5000/api/messages/reply/${id}`,
      { reply },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Reply sent");
    setReply("");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-purple-700">User Complaints</h1>

      {messages.map((msg) => (
        <div key={msg._id} className="p-4 mb-4 bg-white border shadow rounded-xl">
          <h3 className="text-xl font-bold">{msg.title}</h3>
          <p className="mt-2 text-gray-700">{msg.message}</p>
          <p className="mt-1 text-sm text-gray-500">By: {msg.userId.email}</p>

          {msg.reply && (
            <div className="p-3 mt-3 rounded bg-green-50">
              <strong>Reply:</strong> {msg.reply}
            </div>
          )}

          <textarea
            placeholder="Write reply..."
            className="w-full p-2 mt-3 border rounded"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />

          <button
            onClick={() => sendReply(msg._id)}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded-xl"
          >
            Send Reply
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminComplaints;
