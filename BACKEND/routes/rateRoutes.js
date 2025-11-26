import express from "express";
import Rate from "../models/RateModel.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * CREATE RATE (Admin only)
 */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    let { itemName, rate } = req.body;

    if (!itemName || rate === undefined || rate === "")
      return res.status(400).json({ message: "Item name and rate required" });

    const numRate = Number(rate);
    if (isNaN(numRate))
      return res.status(400).json({ message: "Rate must be numeric" });

    const newRate = new Rate({
      itemName: itemName.trim(),
      rate: numRate,
      adminId: req.user._id,
    });

    await newRate.save();
    res.status(201).json(newRate);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET RATES (Admin AND User)
 * ⭐ FIX: User now gets their admin's rates properly
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    let adminId;

    if (req.user.role === "admin") {
      adminId = req.user._id;
    } else {
      adminId = req.user.adminId; // User belongs to this admin
    }

    if (!adminId) {
      return res.status(400).json({ message: "Admin not assigned to this user." });
    }

    const rates = await Rate.find({ adminId }).sort({ itemName: 1 });
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * UPDATE RATE (Admin only)
 */
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Rate.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Rate not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE RATE (Admin only)
 */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Rate.findOneAndDelete({
      _id: req.params.id,
      adminId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: "Rate not found" });

    res.json({ message: "Rate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
