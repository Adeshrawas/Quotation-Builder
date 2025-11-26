import React, { createContext, useContext, useState, useEffect } from "react";

const QuoteContext = createContext();

export const QuoteProvider = ({ children }) => {
  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id || "guest";

  const STORAGE_KEY = `quoteItems_${userId}`;

  // Load user-specific items
  const [quoteItems, setQuoteItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // ** FIX: When login user changes, load THEIR items only **
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setQuoteItems(saved);
  }, [userId]);

  // Auto-save for this specific user
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quoteItems));
  }, [quoteItems, STORAGE_KEY]);

  const addItem = (item) => setQuoteItems((prev) => [...prev, item]);

  const resetQuote = () => {
    setQuoteItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <QuoteContext.Provider value={{ quoteItems, addItem, resetQuote, setQuoteItems }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => useContext(QuoteContext);
