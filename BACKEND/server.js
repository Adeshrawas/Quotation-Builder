import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rateRoutes from "./routes/rateRoutes.js";
import puppeteerRoutes from "./routes/puppeteerRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Ensure default admin exists
    const email = "admin@gmail.com";
    let admin = await User.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = new User({ email, password: hashedPassword, role: "admin", isLoggedIn: true, name: "Super Admin", adminId: null });
      await admin.save();
      console.log(`✅ Admin created: ${email} / admin123`);
    }
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rates", rateRoutes);
app.use("/api/puppeteer", puppeteerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
