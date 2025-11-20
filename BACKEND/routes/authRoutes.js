import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================================
// REGISTER
// ==========================================================
router.post("/register", async (req, res) => {
  const { name, phoneNo, phone, email, password, role, adminKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    // normalization
    const emailLower = email.toLowerCase();

    let user = await User.findOne({ email: emailLower });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // default role is user. Allow admin creation only with adminKey
    let userRole = "user";
    if (role === "admin") {
      if (adminKey === process.env.ADMIN_KEY) {
        userRole = "admin";
      } else {
        return res.status(403).json({ message: "Invalid admin key." });
      }
    }

    const newUser = new User({
      name,
      phoneNo: phoneNo || phone || "",
      email: emailLower,
      password: hashedPassword,
      role: userRole,
      isLoggedIn: false,
      adminId: userRole === "admin" ? null : null, // admin users have null adminId
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully. Please log in.", user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ==========================================================
// LOGIN
// ==========================================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    user.isLoggedIn = true;
    await user.save();

    // include adminId when returning user (frontend may use it)
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name, adminId: user.adminId },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ==========================================================
// LOGOUT
// ==========================================================
router.post("/logout", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      user.isLoggedIn = false;
      await user.save();
    }
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: "Logout failed." });
  }
});

export default router;
