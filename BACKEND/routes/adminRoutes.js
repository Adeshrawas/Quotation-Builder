import express from "express";
import User from "../models/User.js";
import Rate from "../models/RateModel.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================
// 1️⃣ Get all users (Admin only)
// ================================
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ================================
// 2️⃣ Get total registered users (Admin only)
// ================================
router.get("/users/count", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ message: "Error fetching user count" });
  }
});

// ================================
// 3️⃣ Get all items for a specific user (Admin only)
// ================================
router.get("/user/:userId/items", verifyToken, verifyAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    // ✅ Fetch all items related to that user
    const items = await Rate.find({ user: userId });

    // ✅ Normalize item structure regardless of field naming in RateModel
    const formattedItems = items.map((i) => ({
      _id: i._id,
      item: i.itemName || i.item || i.name || "Unnamed Item",
      rate: i.rate || i.value || i.price || 0,
    }));

    res.json(formattedItems);
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ message: "Error fetching user items" });
  }
});

export default router;
