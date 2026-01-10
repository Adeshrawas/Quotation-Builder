import express from "express";
import Rate from "../models/RateModel.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { itemName, rate } = req.body;
    const num = Number(rate);

    if (!itemName || isNaN(num))
      return res.status(400).json({ message: "Invalid data" });

    const newRate = new Rate({
      itemName: itemName.trim(),
      rate: num,
      adminId: req.user._id,
    });

    await newRate.save();
    res.json(newRate);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET
router.get("/", verifyToken, async (req, res) => {
  try {
    const adminId = req.user.role === "admin" ? req.user._id : req.user.adminId;

    const rates = await Rate.find({ adminId });
    res.json(rates);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Rate.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Rate.findOneAndDelete({
      _id: req.params.id,
      adminId: req.user._id,
    });

    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
