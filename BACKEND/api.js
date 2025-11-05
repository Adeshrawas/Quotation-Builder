import express from "express";
import Rate from "./RateModel.js"; // ✅ Correct path now

const router = express.Router();

// Create a new rate
router.post("/rates", async (req, res) => {
  try {
    let { itemName, rate } = req.body;

    if (!itemName || rate === undefined || rate === null || rate === "") {
      return res.status(400).json({ error: "Item name and rate are required" });
    }

    rate = Number(rate);
    if (isNaN(rate)) {
      return res.status(400).json({ error: "Rate must be a valid number" });
    }

    const newRate = new Rate({ itemName, rate });
    await newRate.save();
    res.status(201).json(newRate);
  } catch (err) {
    console.error("Error saving rate:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all rates
router.get("/rates", async (req, res) => {
  try {
    const rates = await Rate.find();
    res.json(rates);
  } catch (err) {
    console.error("Error fetching rates:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update rate by ID
router.put("/rates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, rate } = req.body;

    const updatedRate = await Rate.findByIdAndUpdate(
      id,
      { itemName, rate },
      { new: true }
    );

    if (!updatedRate) {
      return res.status(404).json({ error: "Rate not found" });
    }

    res.json(updatedRate);
  } catch (err) {
    console.error("Error updating rate:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete rate by ID
router.delete("/rates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRate = await Rate.findByIdAndDelete(id);

    if (!deletedRate) {
      return res.status(404).json({ error: "Rate not found" });
    }

    res.json({ message: "Rate deleted successfully" });
  } catch (err) {
    console.error("Error deleting rate:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
