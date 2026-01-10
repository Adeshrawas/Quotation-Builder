import express from "express";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Rate from "../models/RateModel.js";
import bcrypt from "bcryptjs";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// GET USERS
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find(
      { adminId: req.user._id },
      "name phoneNo email role createdAt"
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

// GET USER BY ID
router.get("/single-user/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      adminId: req.user._id,
    }).select("name email phoneNo");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// GET USER ITEMS
router.get("/user/:id/items", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const items = await Item.find({ user: req.params.id });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Error fetching items" });
  }
});

// 🔥 ADD USER — NO VERIFICATION EMAIL, AUTO VERIFIED
router.post("/add-user", verifyToken, verifyAdmin, async (req, res) => {
  const { name, email, password, phoneNo, countryCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    const digits = String(phoneNo).replace(/\D/g, "");
    if (digits.length !== 10)
      return res.status(400).json({ message: "Phone must be 10 digits" });

    const fullPhone = `${countryCode}${digits}`;

    // CREATE USER & AUTO VERIFY
    await User.create({
      name,
      email: email.toLowerCase(),
      phoneNo: fullPhone,
      password: hashed,
      role: "user",
      adminId: req.user._id,
      isVerified: true,  // ✅ NO VERIFICATION REQUIRED
    });

    return res.json({
      message: "User added successfully (no verification required).",
    });
  } catch (err) {
    console.error("ADD-USER ERROR:", err);
    res.status(500).json({ message: "Error adding user" });
  }
});

// EDIT USER
router.put("/edit-user/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, phoneNo, countryCode, password } = req.body;

    const digits = String(phoneNo).replace(/\D/g, "");
    const fullPhone = `${countryCode}${digits}`;

    const update = { name, email, phoneNo: fullPhone };

    if (password && password.trim() !== "") {
      update.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      update,
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ message: "User not found or unauthorized" });

    res.json({ message: "User updated" });
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE USER
router.delete("/delete-user/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({
      _id: req.params.id,
      adminId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
