import React, { useState, useEffect } from "react";
import { PlusCircle, Calculator, Download } from "lucide-react";
import { useRates } from "../context/RateContext";
import { useQuote } from "../context/QuoteContext";
import Select from "react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GenerateQuotation = () => {
  const { rates } = useRates();
  const { quoteItems, addItem, resetQuote } = useQuote();

  const [inputData, setInputData] = useState({
    item: "",
    length: 0.0,
    height: 0.0,
  });

  const [adminLogo, setAdminLogo] = useState(null);
  const [adminName, setAdminName] = useState("Admin"); // ⭐ ADDED FOR PDF DISPLAY

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // ⭐ Fetch ADMIN LOGO + NAME for PDF
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    if (user.role === "admin") {
      setAdminName(user.name || "Admin"); // ⭐ for PDF
      if (user.logoUrl) setAdminLogo(`http://localhost:5000${user.logoUrl}`);
    } 
    else if (user.role === "user" && user.adminId) {
      fetch(`http://localhost:5000/api/auth/admin-logo/${user.adminId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.logoUrl) setAdminLogo(`http://localhost:5000${data.logoUrl}`);
          if (data.adminName) setAdminName(data.adminName); // ⭐ ADDED
        })
        .catch(() => {});
    }
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
      alert("Please select a valid item and enter dimensions.");
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

  // =============================
  // ⭐ UPDATED — LOGO + FROM FIXED
  // =============================
  const handleDownloadReceipt = async () => {
    if (quoteItems.length === 0) {
      alert("No quotation items to download.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.name || user?.email?.split("@")[0] || "User";

    const doc = new jsPDF({ unit: "pt", format: "A4" });

    // Load logo if available
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

    // Add logo (OPTIONAL)
    if (logoImg) {
      doc.addImage(logoImg, "PNG", 230, 20, 150, 80);
    }

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RECEIPT", 297.5, 120, { align: "center" });

    // ⭐ FROM FIELD FIXED HERE
    // Admin sees FROM: AdminName
    // User sees FROM: AdminName
    doc.setFillColor(10, 70, 160);
    doc.roundedRect(60, 150, 475, 60, 8, 8, "F");
    doc.setTextColor("#fff");
    doc.setFontSize(13);
    doc.text(`FROM: ${adminName}`, 80, 175); // ⭐ FIXED
    doc.text(`TO: ${userName}`, 80, 200);

    // Date
    doc.setTextColor("#000");
    const today = new Date().toLocaleDateString();
    doc.text(`Date: ${today}`, 60, 235);

    // Table
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

        <div className="flex flex-col justify-between mb-3 sm:flex-row sm:items-center">
          <h2 className="text-4xl font-extrabold text-left text-gray-800">Generate Quotation</h2>

          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 shadow-md rounded-xl hover:bg-green-700"
          >
            <Download size={18} /> Receipt PDF
          </button>
        </div>

        <p className="mb-10 text-lg text-gray-600">
          Select an item and enter dimensions to calculate the total cost automatically.
        </p>

        {/* --------------------------------------------- */}
        {/*    ALL ORIGINAL DESIGN BELOW (UNCHANGED)      */}
        {/* --------------------------------------------- */}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

          {/* Input Section */}
          <div className="p-6 bg-white border-2 border-gray-100 shadow rounded-3xl hover:shadow-2xl">
            <h3 className="flex items-center pb-3 mb-6 text-2xl font-semibold text-blue-700 border-b">
              <Calculator className="w-6 h-6 mr-2 text-blue-500" /> Calculation Input
            </h3>

            <form onSubmit={handleAddItem}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Select Item
                </label>
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

          {/* Results Section */}
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
                        <th className="px-4 py-3 font-bold text-right text-blue-700">L × H (ft)</th>
                        <th className="px-4 py-3 font-bold text-right text-blue-700">Cost (Rs.)</th>
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
                  <span className="text-3xl font-extrabold">
                    Rs.{totalCost.toFixed(2)}
                  </span>
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

      </div>
    </div>
  );
};

export default GenerateQuotation;
