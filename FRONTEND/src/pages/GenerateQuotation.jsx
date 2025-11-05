import React, { useState, useEffect } from "react";
import { PlusCircle, Calculator } from "lucide-react";
import { useRates } from "../context/RateContext";
import Select from "react-select";

const GenerateQuotation = () => {
  const { rates } = useRates();
  const [inputData, setInputData] = useState({ item: "", length: 0.0, height: 0.0 });
  const [quoteItems, setQuoteItems] = useState([]);

  // Disable scroll for this page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // Only use rates added by admin
  const adminRates = rates.filter((r) => r.user?.role === "admin");

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
    setQuoteItems([
      ...quoteItems,
      {
        id: Date.now(),
        name: inputData.item,
        length: inputData.length.toFixed(1),
        height: inputData.height.toFixed(1),
        cost,
      },
    ]);
    setInputData({ item: "", length: 0.0, height: 0.0 });
  };

  const handleResetQuoteList = () => setQuoteItems([]);

  const totalCost = quoteItems.reduce((sum, item) => sum + parseFloat(item.cost), 0);

  const itemOptions = adminRates.map((r) => ({
    value: r.itemName,
    label: `${r.itemName} (₹${r.rate}/sq.ft)`,
  }));

  return (
    <div className="flex items-start justify-center min-h-screen pt-6 pb-10 bg-gray-50">
      <div className="w-full p-6 bg-white shadow-xl max-w-7xl rounded-3xl md:p-10">
        <h2 className="mb-3 text-4xl font-extrabold text-left text-gray-800">
          Generate Quotation
        </h2>
        <p className="mb-10 text-lg text-left text-gray-600">
          Select an item and enter dimensions to calculate the total cost automatically.
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Input Section */}
          <div className="p-6 transition duration-300 bg-white border-2 border-gray-100 rounded-3xl hover:shadow-2xl">
            <h3 className="flex items-center pb-3 mb-6 text-2xl font-semibold text-blue-700 border-b">
              <Calculator className="w-6 h-6 mr-2 text-blue-500" /> Calculation Input
            </h3>

            <form onSubmit={handleAddItem}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-bold text-gray-700">Select Item</label>
                <Select
                  options={itemOptions}
                  value={itemOptions.find((opt) => opt.value === inputData.item) || null}
                  onChange={(selected) => setInputData({ ...inputData, item: selected.value })}
                  menuPlacement="bottom"
                  placeholder="Select construction item..."
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      height: "3rem",
                      borderRadius: "1rem",
                      border: "2px solid #D1D5DB",
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      borderRadius: "1rem",
                      marginTop: "0.25rem",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? "#E0F2FE" : "white",
                      color: "#1E3A8A",
                      cursor: "pointer",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#1F2937",
                    }),
                  }}
                />
              </div>

              {/* Length & Height Inputs */}
              <div className="flex mb-8 space-x-6">
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-bold text-gray-700">Length (ft)</label>
                  <div className="flex">
                    <input
                      type="number"
                      name="length"
                      value={inputData.length.toFixed(1)}
                      onChange={(e) =>
                        setInputData({ ...inputData, length: parseFloat(e.target.value) || 0.0 })
                      }
                      step="0.1"
                      min="0"
                      className="w-full h-12 p-3 font-mono text-right transition duration-150 border-2 border-gray-300 shadow-inner rounded-l-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="flex items-center justify-center h-12 p-3 font-medium text-gray-600 bg-gray-200 border-r-2 border-gray-300 rounded-r-xl border-y-2">
                      ft
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block mb-2 text-sm font-bold text-gray-700">Height (ft)</label>
                  <div className="flex">
                    <input
                      type="number"
                      name="height"
                      value={inputData.height.toFixed(1)}
                      onChange={(e) =>
                        setInputData({ ...inputData, height: parseFloat(e.target.value) || 0.0 })
                      }
                      step="0.1"
                      min="0"
                      className="w-full h-12 p-3 font-mono text-right transition duration-150 border-2 border-gray-300 shadow-inner rounded-l-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="flex items-center justify-center h-12 p-3 font-medium text-gray-600 bg-gray-200 border-r-2 border-gray-300 rounded-r-xl border-y-2">
                      ft
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center justify-center w-full h-12 px-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98] transition duration-300"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setInputData({ item: "", length: 0.0, height: 0.0 })}
                  className="flex items-center justify-center w-full h-12 px-4 text-gray-700 bg-gray-200 font-semibold rounded-xl shadow-md hover:bg-gray-300 transform hover:scale-[1.02] active:scale-[0.98] transition duration-300"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="p-6 transition duration-300 border-2 border-blue-100 shadow-lg rounded-3xl bg-blue-50 hover:shadow-2xl">
            <h3 className="flex items-center pb-3 mb-6 text-2xl font-semibold text-blue-700 border-b">
              ₹ Calculation Results
            </h3>

            {quoteItems.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white border-2 border-gray-300 border-dashed shadow-inner rounded-xl">
                <p className="text-lg">No items added yet.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 overflow-x-auto shadow-md rounded-xl">
                  <table className="min-w-full divide-y divide-blue-200">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-left text-blue-700 uppercase">
                          Item
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-blue-700 uppercase">
                          L × H (ft)
                        </th>
                        <th className="px-4 py-3 text-xs font-bold tracking-wider text-right text-blue-700 uppercase">
                          Cost (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {quoteItems.map((item) => (
                        <tr key={item.id} className="transition duration-100 hover:bg-blue-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-right text-gray-500 whitespace-nowrap">
                            {item.length} × {item.height}
                          </td>
                          <td className="px-4 py-3 text-sm font-extrabold text-right text-blue-600 whitespace-nowrap">
                            ₹{item.cost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-4 text-white bg-blue-600 shadow-2xl rounded-xl">
                  <span className="text-xl font-bold">Total Quotation Cost:</span>
                  <span className="text-3xl font-extrabold">₹{totalCost.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleResetQuoteList}
                disabled={quoteItems.length === 0}
                className={`flex items-center justify-center mx-auto w-full h-12 px-4 font-bold rounded-xl shadow-xl transition duration-300 ${
                  quoteItems.length === 0
                    ? "bg-red-300 text-gray-100 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600 transform hover:scale-[1.02] active:scale-[0.98]"
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
