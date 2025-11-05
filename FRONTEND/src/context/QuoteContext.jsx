import React, { createContext, useContext, useState, useEffect } from "react";

const QuoteContext = createContext();

export const QuoteProvider = ({ children }) => {
  const [quoteItems, setQuoteItems] = useState(() => {
    // ✅ Initialize from localStorage
    const saved = localStorage.getItem("quoteItems");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Persist to localStorage whenever quoteItems change
  useEffect(() => {
    localStorage.setItem("quoteItems", JSON.stringify(quoteItems));
  }, [quoteItems]);

  const addItem = (item) => setQuoteItems([...quoteItems, item]);

  const resetQuote = () => {
    setQuoteItems([]);
    localStorage.removeItem("quoteItems");
  };

  return (
    <QuoteContext.Provider value={{ quoteItems, addItem, resetQuote, setQuoteItems }}>
      {children}
    </QuoteContext.Provider>
  );
};

// ✅ Custom hook to use context easily
export const useQuote = () => useContext(QuoteContext);
