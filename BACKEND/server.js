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

// serve uploaded files
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    // Default admin
    const email = "admin@gmail.com";
    let admin = await User.findOne({ email });
    if (!admin) {
      const hashed = await bcrypt.hash("admin123", 10);
      admin = new User({
        email,
        password: hashed,
        role: "admin",
        name: "Super Admin",
      });
      await admin.save();
      console.log("Default Admin Created");
    }
  })
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rates", rateRoutes);
app.use("/api/puppeteer", puppeteerRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
