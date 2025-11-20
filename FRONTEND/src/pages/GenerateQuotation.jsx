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

  // Disable scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // ⭐ FIXED: all rates already filtered by admin in backend
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

  const handleDownloadRates = () => {
    if (adminRates.length === 0) {
      alert("No rate items found to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Item Rates", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Item Name", "Rate (Rs./sq.ft)"]],
      body: adminRates.map((i) => [i.itemName, Number(i.rate).toFixed(2)]),
      styles: { font: "helvetica", fontSize: 12, halign: "center" },
      headStyles: { fillColor: [220, 230, 255], textColor: 20 },
      margin: { left: 14, right: 14 },
    });

    doc.save("Item_Rates.pdf");
  };

  return (
    <div className="flex items-start justify-center min-h-screen pt-6 pb-10 bg-gray-50">
      <div className="w-full p-6 bg-white shadow-xl max-w-7xl rounded-3xl md:p-10">
        
        <div className="flex flex-col justify-between mb-3 sm:flex-row sm:items-center">
          <h2 className="text-4xl font-extrabold text-left text-gray-800">Exaltasoft</h2>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadRates}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 shadow-md rounded-xl hover:bg-blue-700"
            >
              <Download size={18} /> Download Item Rates
            </button>
          </div>
        </div>

        <p className="mb-10 text-lg text-gray-600">
          Select an item and enter dimensions to calculate the total cost automatically.
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* Left input section */}
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

          {/* Right result section */}
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
                        <th className="px-4 py-3 font-bold text-right text-blue-700">
                          L × H (ft)
                        </th>
                        <th className="px-4 py-3 font-bold text-right text-blue-700">
                          Cost (Rs.)
                        </th>
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
