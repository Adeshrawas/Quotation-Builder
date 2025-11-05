import express from "express";
import Rate from "../models/RateModel.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Use the consolidated middleware

const router = express.Router();

// CREATE rate
router.post("/", verifyToken, async (req, res) => {
  try {
    // We use req.user._id which is guaranteed to exist by verifyToken middleware
    const { itemName, rate } = req.body;
    const newRate = new Rate({ user: req.user._id, itemName, rate });
    await newRate.save();
    res.status(201).json(newRate);
  } catch (error) {
    res.status(500).json({ message: "Failed to create rate", error });
  }
});

// GET rates
// 🎯 FIX: Implements Data Isolation (Admin sees all, User sees own)
router.get("/", verifyToken, async (req, res) => {
  try {
    let rates;
    
    if (req.user.role === "admin") {
      // Admin: Find ALL rates and populate the user's email/role
      rates = await Rate.find().populate("user", "email role"); 
    } else {
      // Regular User: Find rates associated ONLY with their user ID
      rates = await Rate.find({ user: req.user._id });
    }
    
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rates", error });
  }
});

// UPDATE rate
// 🎯 FIX: Ensures user can only update their own rate, or Admin can update any
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) return res.status(404).json({ message: "Rate not found" });

    // Check ownership or admin status before update
    if (req.user.role !== "admin" && !rate.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied. You can only update your own rates." });
    }

    rate.itemName = req.body.itemName || rate.itemName;
    rate.rate = req.body.rate || rate.rate;
    await rate.save();
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: "Failed to update rate", error });
  }
});

// DELETE rate
// 🎯 FIX: Ensures user can only delete their own rate, or Admin can delete any
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) return res.status(404).json({ message: "Rate not found" });

    // Check ownership or admin status before delete
    if (req.user.role !== "admin" && !rate.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied. You can only delete your own rates." });
    }

    // Use deleteOne or findByIdAndDelete for consistency, or keep remove() if using an older Mongoose version
    await rate.deleteOne(); // Change from deprecated rate.remove()
    res.json({ message: "Rate deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete rate", error });
  }
});

export default router;