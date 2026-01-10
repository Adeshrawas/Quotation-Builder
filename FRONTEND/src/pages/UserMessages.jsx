import React, { useEffect, useState } from "react";
import axios from "axios";

const UserMessages = () => {
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("token");

  const loadMessages = async () => {
    const res = await axios.get("http://localhost:5000/api/messages/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(res.data);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="max-w-3xl p-6 mx-auto">
      <h1 className="mb-4 text-3xl font-bold text-indigo-700">My Messages</h1>

      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div key={msg._id} className="p-4 mb-4 bg-white border shadow-md rounded-xl">
            <h3 className="text-lg font-semibold">{msg.title}</h3>
            <p className="mt-2 text-gray-700">{msg.message}</p>

            {msg.reply && (
              <div className="p-3 mt-3 rounded-lg bg-indigo-50">
                <p className="font-semibold text-indigo-700">Admin Reply:</p>
                <p>{msg.reply}</p>
              </div>
            )}
          </div>
        ))
      )}

      <button
        onClick={loadMessages}
        className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg"
      >
        Refresh Messages
      </button>
    </div>
  );
};

export default UserMessages;
