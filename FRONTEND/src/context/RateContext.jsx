import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const RateContext = createContext();

export const RateProvider = ({ children }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Always get latest token from localStorage
  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch all rates
  const fetchRates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rates", getAxiosConfig());
      setRates(res.data);
    } catch (err) {
      console.error("Error fetching rates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new rate
  const addRate = async (itemName, rate) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/rates",
        { itemName, rate },
        getAxiosConfig()
      );
      setRates((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding rate:", err);
    }
  };

  // Update rate
  const updateRate = async (id, updatedRate) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/rates/${id}`,
        updatedRate,
        getAxiosConfig()
      );
      setRates((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      console.error("Error updating rate:", err);
    }
  };

  // Delete rate
  const deleteRate = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/rates/${id}`, getAxiosConfig());
      setRates((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting rate:", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) fetchRates();
  }, []);

  return (
    <RateContext.Provider
      value={{
        rates,
        setRates,
        loading,
        fetchRates,
        addRate,
        updateRate,
        deleteRate,
      }}
    >
      {children} 
    </RateContext.Provider>
  );
};

export const useRates = () => useContext(RateContext);
