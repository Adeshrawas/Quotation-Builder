import express from "express";
import User from "../models/User.js";
import Rate from "../models/RateModel.js";
import bcrypt from "bcryptjs";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET USERS (Admin-only)
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find(
      { adminId: req.user._id },
      "name phoneNo email role isLoggedIn createdAt"
    ).sort({ createdAt: -1 });

    res.json(users);
  } catch {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// COUNT USERS
router.get("/users/count", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ adminId: req.user._id });
    res.json({ totalUsers });
  } catch {
    res.status(500).json({ message: "Error fetching user count" });
  }
});

// USER ITEMS → return admin's rates
router.get("/user/:id/items", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.adminId.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const rates = await Rate.find({ adminId: req.user._id });
    res.json(rates);
  } catch {
    res.status(500).json({ message: "Error fetching items" });
  }
});

// ADD USER
router.post("/add-user", verifyToken, verifyAdmin, async (req, res) => {
  const { name, email, password, phoneNo, phone, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email & password required." });

  try {
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);

    const finalPhone = phoneNo || phone || "";

    if (finalPhone && !/^\d{10}$/.test(finalPhone)) {
      return res.status(400).json({ message: "Phone must be 10 digits." });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      phoneNo: finalPhone,
      password: hashed,
      role: role || "user",
      adminId: req.user._id,
    });

    await user.save();
    res.status(201).json({ message: "User added successfully." });
  } catch {
    res.status(500).json({ message: "Error adding user" });
  }
});

// DELETE USER
router.delete("/delete-user/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.adminId.equals(req.user._id))
      return res.status(403).json({ message: "Access denied." });

    await User.findByIdAndDelete(user._id);

    res.json({ message: "User deleted successfully." });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
