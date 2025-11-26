import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phoneNo: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },

    // Every user belongs to an admin
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Admin logo URL (served from /uploads/admin-logos/...)
    logoUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
