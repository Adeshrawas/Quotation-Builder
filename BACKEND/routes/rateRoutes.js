import express from "express";
import Rate from "../models/RateModel.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ------------------ CREATE RATE ----------------------- */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { itemName, rate } = req.body;

    if (!itemName || rate === undefined) {
      return res.status(400).json({ message: "Item name and rate required" });
    }

    const newRate = new Rate({
      adminId: req.user._id,   // ⭐ CORRECT OWNER FIELD
      itemName,
      rate,
    });

    await newRate.save();

    res.status(201).json(newRate);
  } catch (error) {
    console.log("Create rate error:", error);
    res.status(500).json({ message: "Create rate failed" });
  }
});

/* ------------------ GET RATES ------------------------- */
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const rates = await Rate.find({ adminId: req.user._id });
    res.json(rates);
  } catch (error) {
    console.log("Fetch rates error:", error);
    res.status(500).json({ message: "Fetch rates failed" });
  }
});

/* ------------------ UPDATE RATE ----------------------- */
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const rate = await Rate.findOne({
      _id: req.params.id,
      adminId: req.user._id, // ⭐ ensure only admin edits his rates
    });

    if (!rate) return res.status(404).json({ message: "Rate not found" });

    rate.itemName = req.body.itemName;
    rate.rate = req.body.rate;

    await rate.save();
    res.json(rate);
  } catch (error) {
    console.log("Update rate error:", error);
    res.status(500).json({ message: "Update rate failed" });
  }
});

/* ------------------ DELETE RATE ----------------------- */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const rate = await Rate.findOne({
      _id: req.params.id,
      adminId: req.user._id, // ⭐ ensure only admin deletes his rates
    });

    if (!rate) return res.status(404).json({ message: "Rate not found" });

    await rate.deleteOne();
    res.json({ message: "Rate deleted successfully" });
  } catch (error) {
    console.log("Delete rate error:", error);
    res.status(500).json({ message: "Delete rate failed" });
  }
});

export default router;
