import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadLogo } from "../middleware/uploadLogo.js";

const router = express.Router();

// REGISTER (supports logo upload) - field name: "logo"
router.post("/register", uploadLogo.single("logo"), async (req, res) => {
  const { name, phoneNo, phone, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email & password required." });
  }

  try {
    const emailLower = email.toLowerCase().trim();
    const exist = await User.findOne({ email: emailLower });
    if (exist) return res.status(400).json({ message: "User already exists." });

    const hashed = await bcrypt.hash(password, 10);

    const finalPhone = phoneNo || phone || "";

    if (finalPhone && !/^\d{10}$/.test(finalPhone)) {
      return res.status(400).json({ message: "Phone must be 10 digits." });
    }

    // file saved to uploads/admin-logos/<filename>
    const logoUrl = req.file ? `/uploads/admin-logos/${req.file.filename}` : null;

    const newUser = new User({
      name: name.trim(),
      phoneNo: finalPhone,
      email: emailLower,
      password: hashed,
      role: role || "user",
      adminId: null,
      logoUrl,
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    user.isLoggedIn = true;
    await user.save();

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        adminId: user.adminId,
        logoUrl: user.logoUrl || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// LOGOUT
router.post("/logout", verifyToken, async (req, res) => {
  try {
    req.user.isLoggedIn = false;
    await req.user.save();
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed." });
  }
});

// GET ADMIN LOGO BY ADMIN ID
router.get("/admin-logo/:id", async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select("logoUrl name");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ logoUrl: admin.logoUrl || null, name: admin.name || null });
  } catch (err) {
    console.error("admin-logo error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
