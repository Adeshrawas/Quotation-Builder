import express from "express";
import User from "../models/User.js";
import Rate from "../models/RateModel.js";
import bcrypt from "bcryptjs";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1️⃣ Get all users (only users created by this admin)
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find(
      { adminId: req.user._id },
      "name phoneNo email role isLoggedIn createdAt updatedAt"
    ).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 2️⃣ Get total users (only this admin's users)
router.get("/users/count", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ adminId: req.user._id });
    res.json({ totalUsers });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ message: "Error fetching user count" });
  }
});

// 3️⃣ Get items (rates) for a user - returns rates owned by this admin
// Frontend calls /user/:userId/items — we'll honor it but only return admin's rates.
router.get("/user/:userId/items", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // We ignore the userId for access control and return rates for this admin.
    const rates = await Rate.find({ adminId: req.user._id }).select("_id itemName rate");
    const formatted = rates.map((i) => ({
      _id: i._id,
      item: i.itemName,
      rate: i.rate,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ message: "Error fetching user items" });
  }
});

// 4️⃣ Add new user (Admin only) - user will be bound to adminId
router.post("/add-user", verifyToken, verifyAdmin, async (req, res) => {
  const { name, phoneNo, phone, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  try {
    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phoneNo: phoneNo || phone || "",
      email: emailLower,
      password: hashedPassword,
      role: role || "user",
      adminId: req.user._id, // ⭐ bind this new user to the admin
    });

    await newUser.save();
    res.status(201).json({ message: "User added successfully.", user: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Error adding user." });
  }
});

// 5️⃣ DELETE USER (Admin only) - only delete users that belong to this admin
router.delete("/delete-user/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.adminId || !user.adminId.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied. You can only delete your users." });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Delete user failed." });
  }
});

export default router;
