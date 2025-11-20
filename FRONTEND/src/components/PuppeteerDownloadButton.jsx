import React from "react";
import axios from "axios";
import { Download } from "lucide-react";

const PuppeteerDownloadButton = () => {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/puppeteer/download", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // important for file downloads
      });

      // Create a URL and trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "download.png"); // filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Check console for details.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl"
    >
      <Download size={16} /> Download
    </button>
  );
};

export default PuppeteerDownloadButton;
