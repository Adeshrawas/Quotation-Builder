import React, { useEffect } from "react";

export default function Notify({ type = "error", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed z-50 top-6 right-6">
      <div
        className={`px-5 py-3 rounded-xl shadow-xl text-white flex items-center gap-3
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        <span className="font-semibold">{message}</span>
        <button onClick={onClose} className="text-white">✕</button>
      </div>
    </div>
  );
}
