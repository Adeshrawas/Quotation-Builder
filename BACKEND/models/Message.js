import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    category: { type: String, default: "General" },
    title: { type: String, required: true },
    message: { type: String, required: true },

    reply: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
