import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// ==========================================================
// REGISTER ROUTE
// ==========================================================
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password." });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Safe role assignment
    let userRole = "user"; // default role
    if (role === "admin") {
      // Only allow admin creation if secret admin key provided (optional for security)
      if (req.body.adminKey === process.env.ADMIN_KEY) {
        userRole = "admin";
      }
    }

    // Create user
    user = new User({ 
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      isLoggedIn: false
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully. Please log in." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ==========================================================
// LOGIN ROUTE
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

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ==========================================================
// LOGOUT ROUTE
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
